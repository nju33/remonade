const {h, render, Component, Text} = require('ink');
const termSize = require('term-size');

class Counter extends Component {
	constructor() {
		super();

		this.state = {
			rowLength: Math.floor(termSize().rows / 2),
			log: {
				local: [],
				remote: []
			},
			i: 0
		};
	}

	get localLogs() {
		Array.from(this.state.log.local)
			.reverse()
			.slice(0, this.state.rowLength - 3)
			.reverse();
		return [
		]
	}

	get remoteLogs() {
		return [
			...Array(this.state.rowLength - 3).fill(''),
			...Array.from(this.state.log.remote)
		].reverse().slice(0, this.state.rowLength - 3).reverse();
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
			const filler = Array(0, this.state.rowLength - 3).fill('');
			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - 3);

		})();

		return (
			<div>
				<div>
					<div>
						<Text>Local</Text>
					</div>
					{localLogs.map(line => (
						<div>{line}</div>
					))}
					{/* <Text green>
						{this.state.i} tests passed
					</Text> */}
				</div>
				<div>
					<div>
						<Text>Remote</Text>
					</div>
					{this.remoteLogs.map(line => (
						<div>{line}</div>
					))}
				</div>
			</div>
		);
	}

	componentDidMount() {
		this.timer = setInterval(() => {
			this.setState({
				log: {
					local: [...this.state.log.local, Math.random()],
					remote: [...this.state.log.remote, Math.random()]
				},
				i: this.state.i + 1
			});
		}, 500);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

render(<Counter/>);
