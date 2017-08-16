import {h, Component, Text} from 'ink';
import termSize from 'term-size';
import Subject from 'components/subject';
import RemoteMachine from 'helpers/remote-machine';

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
		const remoteMachine = new RemoteMachine(this.props.ssh);
		const command = await remoteMachine.makeCommand();
		command.stream.on('data', data => {
			console.log(data.toString());
		});
		command.run(this.props.commands);

		this.timer = setInterval(() => {
			this.setState({
				log: {
					local: [...this.state.log.local, Math.random()],
					remote: [...this.state.log.remote, Math.random()]
				},
				// i: this.state.i + 1
			});
		}, 50000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}
}