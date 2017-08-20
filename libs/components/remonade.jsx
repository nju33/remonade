import path from 'path';
import {h, Component, Text} from 'ink';
import chokidar from 'chokidar';
import termSize from 'term-size';
import execa from 'execa';
import debounce from 'lodash.debounce';
import chalk from 'chalk';
import exitHook from 'async-exit-hook';
import Subject from 'components/subject';
import Log from 'components/log';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';
import Cup from 'helpers/cup';
import Rsync from 'helpers/rsync';

const ADJUST_ROW_NUMBER = 5;

export default class Remonade extends Component {
	constructor(props) {
		super(props);

		const termSizeData = termSize();
		this.state = {
			rowLength: Math.floor(termSizeData.rows / 2 - ADJUST_ROW_NUMBER),
			colLength: termSizeData.columns,
			log: {
				local: [],
				remote: []
			}
		};
	}

	updateLocalLog(chunk) {
		if (chunk.length === 0) {
			return;
		}
		process.nextTick(() => {
			const nextLog = Object.assign({}, this.state.log);
			nextLog.local.push(...chunk);
			this.setState({log: nextLog})
		});
	}

	updateRemoteLog(chunk) {
		if (chunk.length === 0) {
			return;
		}
		process.nextTick(() => {
			const nextLog = Object.assign({}, this.state.log);
			nextLog.remote.push(...chunk);
			this.setState({log: nextLog})
		});
	}

	beforeExit(cb, remoteMachine, command) {
		const killCommand = new Command([
			'ps aux',
			`grep '${command.command}'`,
			'cut -d " " -f 2',
			'xargs -n 9999 kill -9'
		].join(' | '), false);
		killCommand.on('end', cb);
		remoteMachine.runCommands([killCommand]);
	}

	render() {
		return (
			<div>
				<div>
					<Subject color="green">Local</Subject>
					<Log
						rowLength={this.state.rowLength}
						colLength={this.state.colLength}
						log={this.state.log.local}
					/>
				</div>
				<div>
					<Subject color="red">Remote</Subject>
					<Log
						rowLength={this.state.rowLength}
						colLength={this.state.colLength}
						log={this.state.log.remote}
					/>
				</div>
			</div>
		);
	}

	async execLocalSync(rsync, cup) {
		this.updateLocalLog([chalk.gray(`\$ ${rsync.command}`)]);

		return new Promise(resolve => {
			execa.shell(rsync.command).stdout
				.on('data', line => {
					const chunk = cup.pour(line.toString().split('\n'));
					this.updateLocalLog(chunk);
				})
				.on('close', () => {
					this.updateLocalLog(cup.data)
					resolve();
				});
		});
	}

	async execRemoteSync(rsync, cup) {
		this.updateRemoteLog([chalk.gray(`\$ ${rsync.command}`)]);

		return new Promise(resolve => {
			execa.shell(rsync.command).stdout
				.on('data', line => {
					const chunk = cup.pour(line.toString().split('\n'));
					this.updateRemoteLog(chunk);
				})
				.on('close', () => {
					this.updateRemoteLog(cup.data)
					resolve();
				});
		});
	}

	runCommands(hookCommands, remoteMachine, cup) {
		return new Promise((resolve, reject) => {
			const commands = hookCommands.map(line => {
				const command = new Command(line);
				command
					.on('run', runner => {
						this.updateRemoteLog([
							chalk.gray(`\$ ${runner.command}`)
						]);

						process.nextTick(resolve);
					})
					.on('data', line => {
						const chunk = cup.pour(line.toString().split('\n'));
						if (chunk.lenght === 0) {
							return;
						}
						this.updateRemoteLog(chunk);
					})
					.on('error', line => {
						const chunk = cup.pour(line.toString().split('\n'));
						if (chunk.lenght === 0) {
							return;
						}
						this.updateRemoteLog(chunk);

						process.nextTick(reject);
					});

				exitHook(cb => {
					this.beforeExit(cb, remoteMachine, command);
				});
				return command;
			});
			remoteMachine.runCommands(commands);
		});
	}

	handleLocal(volume, remoteMachine, rsync, cup) {
		const watcher = chokidar.watch(volume.localPattern, {});
		const handle = async () => {
			if (volume.hasBeforeSync()) {
				await this.runCommands(volume.beforeSyncCommands, remoteMachine, cup);
			}

			if (volume.hasBeforeSyncOnce() && !volume.executedBeforeSyncOnce) {
				await this.runCommands(volume.beforeSyncOnceCommands, remoteMachine, cup);
				volume.executedBeforeSyncOnce = true;
			}

			await this.execLocalSync(rsync, cup);

			if (volume.hasAfterSync()) {
				await this.runCommands(volume.afterSyncCommands, remoteMachine, cup);
			}

			if (volume.hasAfterSyncOnce() && !volume.executedAfterSyncOnce) {
				await this.runCommands(volume.afterSyncOnceCommands, remoteMachine, cup);
				volume.executedAfterSyncOnce = true;
			}
			// const commands = volume.afterSyncCommands.map(line => {
			// 	const command = new Command(line);
			// 	command
			// 		.on('run', runner => {
			// 			this.updateRemoteLog([
			// 				chalk.gray(`\$ ${runner.command}`)
			// 			]);
			// 		})
			// 		.on('data', line => {
			// 			const chunk = cup.pour(line.toString().split('\n'));
			// 			if (chunk.lenght === 0) {
			// 				return;
			// 			}
			// 			this.updateRemoteLog(chunk.concat(['done']));
			// 		});
			//
			// 	exitHook(cb => {
			// 		this.beforeExit(cb, remoteMachine, command);
			// 	});
			// 	return command;
			// });
			// remoteMachine.runCommands(commands);
		};

		watcher
			.on('ready', handle)
			.on('change', handle);
	}

	handleRemote(volume, remoteMachine, rsync, cup) {
		const watcher = new Command(
			`node dist/remonade-chokidar.js --pattern '${volume.remotePattern}'`
		);

		const handleData = debounce(line => {
			switch (line.toString().trim()) {
				case 'CHANGED': {
					this.execRemoteSync(rsync, cup);
				}
			}
		}, 100);
		watcher.on('data', handleData)
		// watcher.on('end', () => {
		// 	console.log('end');
		// });
		remoteMachine.runCommands([watcher]);

		exitHook(cb => {
			this.beforeExit(cb, remoteMachine, watcher);
		});
	}

	async componentDidMount() {
		const remoteMachine = new RemoteMachine(this.props.ssh);

	  this.props.volumes.forEach(volume => {
			const rsync = new Rsync(volume, this.props.ssh);
			const cup = new Cup(3);

			if (volume.main === 'local') {
				this.handleLocal(volume, remoteMachine, rsync, cup);
			} else {
				this.handleRemote(volume, remoteMachine, rsync, cup);
			}
		});
	}
}
