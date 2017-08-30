/* @flow */

import {h, Component} from 'ink';
import * as React from 'react';
import termSize from 'term-size';
import bind from 'lodash-decorators/bind';
import Subject from 'components/subject';
import Log from 'components/log';

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
    const adjustHeight = remoteLength * 1.5;
    this.state = {
      rowLength: Math.floor((termSizeData.rows / remoteLength) - adjustHeight),
      colLength: termSizeData.columns,
      counter: 0
    };
  }

  render() {
    const subjects = this.props.machines.map(machine => {
      return (
        <div key={machine.label}>
          <Subject color={machine.color}>
            {machine.label} ∇ {machine.logfilename}
          </Subject>
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
    const {machines} = this.props;

    machines.forEach(machine => {
      machine.runImmidiatelyTasks();
      machine.on('update', this._updateView);
    });
  }
}
