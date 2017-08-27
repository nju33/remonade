import path from 'path';
import {h, Component, Text} from 'ink';
import R from 'ramda';
import chunk from 'lodash.chunk';
import chokidar from 'chokidar';
import termSize from 'term-size';
import execa from 'execa';
import Subject from 'components/subject';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';
import Cup from 'helpers/cup';
import Rsync from 'helpers/rsync';
import colorLog from 'helpers/color-log';

export default class Remonade extends Component {
	constructor(props) {
		super(props);

		this.state = {
			log: []
		};
	}

	render() {
    const {rowLength, colLength, log} = this.props;

		const nextLog = (() => {
			if (log.length === 0) {
				return Array(rowLength).fill('');
			}

			const newLog = R.flatten(
				Array.from(log).map(line => (
					chunk(line, colLength).map(group => group.join(''))
				))
			)
				.reverse()
  			.slice(0, rowLength)
  			.reverse();
			const filler = Array(rowLength).fill('');

			return [
				...newLog,
				...filler
			].slice(0, rowLength);
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
