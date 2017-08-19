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

const ADJUST_ROW_NUMBER = 5;

export default class Remonade extends Component {
	constructor(props) {
		super(props);

		this.state = {
			log: []
		};
	}

	updateLocalLog(chunk) {
		process.nextTick(() => {
			const nextLog = Object.assign({}, this.state.log);
			nextLog.local.push(...chunk);
			this.setState({log: nextLog})
		});
	}

	render() {
    const {roLength, children: Children} = this.props;

		const log = (() => {
			if (this.state.log.length === 0) {
				return Array(rowLength - ADJUST_ROW_NUMBER).fill('');
			}

			const logs = Array.from(this.state.log)
				.reverse()
				.slice(0, this.state.rowLength - ADJUST_ROW_NUMBER)
				.reverse();
			const filler = Array(this.state.rowLength - ADJUST_ROW_NUMBER).fill('');

			return [
				...logs,
				...filler
			].slice(0, this.state.rowLength - ADJUST_ROW_NUMBER);
		})();

		return (
      <div>
        <Children/>
        {
          log.map(line => (
            <div>{line}</div>
          ))
        }
      </div>
    )
	}
}
