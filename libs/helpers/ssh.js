/* @flow */

import fs from 'fs';
import {promisify} from 'util';
import pProps from 'p-props';

export default class Ssh {
  config: SshConfig;

  constructor(config: SshConfig) {
    this.config = config;
  }

  async init() {
    await pProps({
      ...this.config,
      privateKey: promisify(fs.readFile)(this.config.identifyFile)
    });
  }
}
