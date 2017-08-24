/* @flow */

import Ssh from 'helpers/ssh';

// type MachineType = 'Local' | 'Remote';

export default class Machine {
  label: string;
  base: string;
  ssh: ?Ssh;

  constructor(config: MachineConfig) {
    this.label = config.label;
    this.base = config.base;
    if (config.ssh) {
      this.ssh = config.ssh;
    }
  }

  // get type(): MachineType {
  //   return this.ssh ? 'Remote' : 'Local';
  // }

  get userHost(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return `${this.ssh.config.username}@${this.ssh.config.host}`;
  }

  get identifyFile(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return this.ssh.config.identifyFile;
  }

  ensureSyncPath(dir: string): string {
    if (this.ssh) {
      return `${this.userHost}:${dir}`;
    }
    return dir;
  }
}
