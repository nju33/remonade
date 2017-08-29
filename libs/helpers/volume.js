/* @flow */

import EventEmitter from 'events';
import path from 'path';
import Rsync from 'rsync';
import chokidar from 'chokidar';
import bind from 'lodash-decorators/bind';
import ExitHook from 'async-exit-hook';
import Machine from 'helpers/machine';

export default class Volume extends EventEmitter {
  from: Machine;
  to: Machine;
  remote: Machine;
  localMachine: Machine;
  path: {[label: string]: string};
  pattern: {[label: string]: string};

  constructor(machines: Array<Machine>) {
    super();

    machines.forEach(machine => {
      (this: any)[machine.label] = ([dirPath: string]) => {
        if (!machine.isLocal()) {
          if (this.remote instanceof Machine) {
            throw new Error(`Already set up remote to ${this.to.label}`);
          }
        }

        if (!(this.from instanceof Machine)) {
          this.from = machine;
          if (machine.isLocal()) {
            this.localMachine = machine;
          } else {
            this.remote = machine;
          }
        } else if (!(this.to instanceof Machine)) {
          this.to = machine;
          if (machine.isLocal()) {
            this.localMachine = machine;
          } else {
            this.remote = machine;
          }
        }

        (l => {
          if (machine.base === null) {
            this.path[l] = dirPath;
          } else {
            this.path[l] = path.join(machine.base, dirPath);
          }
          this.pattern[l] = path.join(this.path[l], '**/*');
        })(machine.label);
        return this;
      };
    });
    this.path = {};
    this.pattern = {};
  }

  get _machines(): Array<Machine> {
    return [this.from, this.to];
  }

  get identifyFile(): string {
    return this.remote.identifyFile;
  }

  get rsyncCommand(): string {
    const fromLabel = this.from.label;
    const from = this.from.getRsyncPath(this.path[fromLabel]);
    const toLabel = this.to.label;
    const to = this.to.getRsyncPath(this.path[toLabel]);

    return new Rsync()
      .shell(`ssh -i ${this.identifyFile}`)
      .flags('arv')
      .set('delete')
      .source(from)
      .destination(to)
      .command();
  }

  @bind()
  _handleReady(): void {
    this.emit('ready');
  }

  // @bind()
  // _handleAdd(): void {
  //   this.emit('add');
  // }

  @bind()
  _handleChange(): void {
    this.emit('change');
  }

  @bind()
  _watchFiles(): Volume {
    chokidar.watch(this.pattern.local)
      .on('ready', this._handleReady)
      // .on('add', this._handleAdd)
      .on('change', this._handleChange);
    return this;
  }
}
