/* @flow */

import Ssh from 'helpers/ssh';
import type {SshProp} from 'helpers/ssh';

// type MachineType = 'Local' | 'Remote';

export default class Machine {
  label: string;
  tasks: Array<{workdir?: string, command: string}>
  base: string | null;
  ssh: ?Ssh;

  constructor(label: string, base: string | null, ssh: ?Ssh) {
    this.label = label;
    this.base = base;
    if (typeof ssh !== 'undefined') {
      this.ssh = ssh;
    }
  }

  get type(): string {
    return typeof this.ssh === 'undefined' ? 'local' : 'remote';
  }

  isLocal(): boolean {
    return this.type === 'local';
  }

  get userHost(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return `${(this.ssh: SshProp).username}@${(this.ssh: SshProp).host}`;
  }

  get identifyFile(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return (this.ssh: SshProp).identifyFile;
  }

  ensureSyncPath(dir: string): string {
    if (this.ssh) {
      return `${this.userHost}:${dir}`;
    }
    return dir;
  }
}
