import path from 'path';
import {h, Component, Text} from 'ink';
import Rsync from 'rsync';
import chokidar from 'chokidar';
import termSize from 'term-size';
import Subject from 'components/subject';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';

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

	render() {
		const localLogs = (() => {
			if (this.state.log.local.length === 0) {
				return Array(this.state.rowLength - 3).fill('');
			}

			const logs = Array.from(this.state.log.local)
				.reverse()
				.slice(0, this.state.rowLength - 3)
				.reverse();
			const filler = Array(this.state.rowLength - 3).fill('');
			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - 3);
		})();

		const remoteLogs = (() => {
			if (this.state.log.remote.length === 0) {
				return Array(this.state.rowLength - 3).fill('');
			}

			const logs = Array.from(this.state.log.remote)
				.reverse()
				.slice(0, this.state.rowLength - 3)
				.reverse();
			const filler = Array(this.state.rowLength - 3).fill('');
			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - 3);
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
			chokidar.watch(volume.localPattern).on('all', (ev, path) => {
				console.log(path);
				const rsync = new Rsync()
					.shell('ssh')
					.flags('aznv')
					.source(volume.localPath)
					.destination(volume.remotePath);
			});
		});

		const remoteMachine = new RemoteMachine(this.props.ssh);
		const commands = this.props.commands
			.map(commandText => {
				const command = new Command(commandText)
				command.on('log', lines => {
					const nextLog = Object.assign({}, this.state.log);
					nextLog.local = [
						...nextLog.local,
						...lines
					];
					this.setState({
						log: nextLog,
						i: this.state.i + 1
					});
				});
				return command;
			});

		remoteMachine.runCommands(commands);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}
}
