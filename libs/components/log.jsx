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

	render() {
    const {rowLength, log} = this.props;

		const nextLog = (() => {
			if (log.length === 0) {
				return Array(rowLength - ADJUST_ROW_NUMBER).fill('');
			}

			const newLog = Array.from(log)
				.reverse()
				.slice(0, rowLength - ADJUST_ROW_NUMBER)
				.reverse();
			const filler = Array(rowLength - ADJUST_ROW_NUMBER).fill('');

			return [
				...newLog,
				...filler
			].slice(0, rowLength - ADJUST_ROW_NUMBER);
		})();

		return (
      <div>
        {
          nextLog.map(line => (
            <div>{line}</div>
          ))
        }
      </div>
    )
	}
}
