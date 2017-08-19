import path from 'path';
import {h, Component, Text} from 'ink';
import chokidar from 'chokidar';
import termSize from 'term-size';
import execa from 'execa';
import Subject from 'components/subject';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';
import Cup from 'helpers/cup';
import Rsync from 'helpers/rsync';

export default class Remonade extends Component {
	constructor(props) {
		super(props);

		this.state = {
			rowLength: Math.floor(termSize().rows / 2),
			log: {
				local: [],
				remote: []
			},
			i: 0
		};
	}

	updateLocalLog(chunk) {
		process.nextTick(() => {
			const nextLog = Object.assign({}, this.state.log);
			nextLog.local.push(...chunk);
			this.setState({log: nextLog})
		});
	}

	updateRemoteLog() {

	}

	render() {
		const localLogs = (() => {
			if (this.state.log.local.length === 0) {
				return Array(this.state.rowLength - 5).fill('');
			}

			const logs = Array.from(this.state.log.local)
				.reverse()
				.slice(0, this.state.rowLength - 5)
				.reverse();
			const filler = Array(this.state.rowLength - 5).fill('');
			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - 5);
		})();

		const remoteLogs = (() => {
			if (this.state.log.remote.length === 0) {
				return Array(this.state.rowLength - 5).fill('');
			}

			const logs = Array.from(this.state.log.remote)
				.reverse()
				.slice(0, this.state.rowLength - 5)
				.reverse();
			const filler = Array(this.state.rowLength - 5).fill('');
			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - 5);
		})();

		return (
			<div>
				<div>
					<Subject color="green">Local</Subject>
					{localLogs.map(line => (
						<div>{line}</div>
					))}
				</div>
				<div>
					<Subject color="red">Remote</Subject>
					{remoteLogs.map(line => (
						<div>{line}</div>
					))}
				</div>
			</div>
		);
	}

	async componentDidMount() {
	  this.props.volumes.forEach(volume => {
			const watcher = chokidar.watch(volume.localPattern, {})
			const rsync = new Rsync(volume, this.props.ssh);
			const cup = new Cup(3);
			watcher
				.on('change', (ev, path) => {
					execa.shell(rsync.command).stdout
						.on('data', line => {
							const chunk = cup.pour(line.toString().split('\n'));
							if (chunk.length === 0) {
								return;
							}
							this.updateLocalLog(chunk);
						})
						.on('close', () => {
							this.updateLocalLog(cup.data);
						});
						// .then(result => {
						// 	const nextLog = Object.assign({}, this.state.log);
						// 	nextLog.local.push([...result.stdout.split('\n')]);
						// 	this.setState({log: nextLog})
						// });
				});
		});
		//
		// const remoteMachine = new RemoteMachine(this.props.ssh);
		// const commands = this.props.commands
		// 	.map(commandText => {
		// 		const command = new Command(commandText)
		// 		command.on('log', lines => {
		// 			const nextLog = Object.assign({}, this.state.log);
		// 			nextLog.local = [
		// 				...nextLog.local,
		// 				...lines
		// 			];
		// 			this.setState({
		// 				log: nextLog,
		// 				i: this.state.i + 1
		// 			});
		// 		});
		// 		return command;
		// 	});
		//
		// remoteMachine.runCommands(commands);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}
}
