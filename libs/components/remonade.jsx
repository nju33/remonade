/* @flow */

// import path from 'path';
import {h, Component} from 'ink';
import * as React from 'react';
import chokidar from 'chokidar';
import termSize from 'term-size';
import execa from 'execa';
import debounce from 'lodash.debounce';
import chalk from 'chalk';
import bind from 'lodash-decorators/bind';
import exitHook from 'async-exit-hook';
import Subject from 'components/subject';
import Log from 'components/log';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';
import Cup from 'helpers/cup';
import Rsync from 'helpers/rsync';

// const ADJUST_ROW_NUMBER = 4;

export default class Remonade extends Component {
  props: Config;
  state: {
    rowLength: number,
    colLength: number,
    counter: number
  };

  constructor(props: Config) {
    super(props);

    const termSizeData = termSize();
    const remoteLength = props.machines.length;
    const adjustHeight = remoteLength * 2;
    this.state = {
      rowLength: Math.floor((termSizeData.rows / remoteLength) - adjustHeight),
      colLength: termSizeData.columns,
      counter: 0
    };
  }

  render() {
    const subjects = this.props.machines.map(machine => {
      return (
        <div>
          <Subject color={machine.color}>{machine.label}</Subject>
          <Log
            rowLength={this.state.rowLength}
            colLength={this.state.colLength}
            log={machine.logs}
          />
        </div>
      );
    });

    return (
      <div>
        {subjects}
      </div>
    );
  }

  @bind()
  _updateView() {
    this.setState({counter: this.state.counter + 1});
  }

  async componentDidMount() {
    const {machines, volumes} = this.props;

    machines.forEach(machine => {
      machine.runImmidiatelyTasks();
      machine.on('update', this._updateView);
    });
  }
}
