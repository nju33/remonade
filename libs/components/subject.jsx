/* @flow */

import {h, Component, Text} from 'ink';
import * as React from 'react';

module.exports = class Subject extends Component {
  render() {
    const color = this.props.color;
    const bgColor = (() => {
      if (!this.props.color) {
        return null;
      }
      return 'bg' +
        this.props.color.charAt(0).toUpperCase() +
        this.props.color.slice(1)
    })();
    const text = this.props.children.join();
    return (
      <div>
        <Text {...{[bgColor]: bgColor}} white>   </Text>
        <Text {...{[color]: color}} bold underline> {text} </Text>
      </div>
    );
  }
};
