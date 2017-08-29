/* @flow */

import * as React from 'react';
import {h, Component} from 'ink';
import R from 'ramda';
import chalk from 'chalk';
import chunk from 'lodash.chunk';

export default class Remonade extends Component {
  props: {
    rowLength: number,
    colLength: number,
    log: Array<string>
  };

  render() {
    const {rowLength, colLength, log} = this.props;

    const nextLog = (() => {
      if (log.length === 0) {
        return Array(rowLength).fill('');
      }

      const newLog = R.flatten(
        Array.from(log).map(fragment => (
          fragment.split('\n').map(line => (
            chunk(line, colLength).map((() => {
              let isCommand = false;

              return group => {
                let line = group.join('');
                if (!isCommand && /^\$.+/.test(line)) {
                  isCommand = true;
                } else if (isCommand) {
                  line = '» ' + line;
                }
                return line;
              }
            })())
          ))
        ))
      )
        .reverse()
        .slice(0, rowLength)
        .reverse();
      const filler = Array(rowLength).fill('');

      return [
        ...newLog,
        ...filler
      ]
        .slice(0, rowLength)
        .map(line => (
          line
            .replace(/[\w.-_/:@]+|".+"|'.+'|^(?:\$|»).+/g, matches => {
              if (/^(?:\$|»).+/.test(matches)) {
                return chalk.gray(matches);
              } else if (/^\d+$/.test(matches)) {
                return chalk.blue(matches);
              } else if (/^[\w.-_/:@]+\.(?!\.)([\w.-_/:@]+(?:\.(?!\.))?){2,}$/.test(matches)) {
                if (matches.split('.').some(p => isNaN(Number(p)))) {
                  return chalk.yellow(matches);
                }
                return chalk.blue(matches);
              } else if (/(.+\/.+)+|^(\/.+)+/.test(matches)) {
                return chalk.yellow(matches);
              }
              return matches;
            })
        ));
    })();

    return (
      <div>
        {
          nextLog.map(line => (
            (
              /* eslint-disable */
                <div>
                  {line}
                </div>
              /* eslint-enable */
            )
          ))
        }
      </div>
    );
  }
}
