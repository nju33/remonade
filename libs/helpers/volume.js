/* @flow */

import path from 'path';
import Rsync from 'rsync';
// import R from 'ramda';
import CommandEffect from 'helpers/command-effect';
import Machine from 'helpers/machine';
import Command from 'helpers/command';
// import commandsFlatten from 'helpers/commands-flatten';

type commandType = 'Before' | 'BeforeOnce' | 'After' | 'AfterOnce';

export default class Volume {
  from: Machine;
  to: Machine;
  remote: Machine;
  local: Machine;
  fromLabel: string;
  toLabel: string;
  remoteLabel: string;
  remoteMachine: any;
  command: {[commandType]: string};
  commandEffect: {[commandType]: CommandEffect};
  // [string]: (strjing) => Volume;
  // base: {[label: string]: string};
  path: {[label: string]: string};
  pattern: {[label: string]: string};

  constructor(machines: Array<Machine>) {
    machines.forEach(machine => {
      (this: any)[machine.label] = ([dirPath: string]) => {
        if (machine.type !== 'local') {
          if (this.remote instanceof Machine) {
            throw new Error(`Already set up remote to ${this.toLabel}`);
          }
          this.remote = machine;
        }

        if (!(this.from instanceof Machine)) {
          this.from = machine;
          if (machine.type === 'local') {
            this.local = machine;
          } else {
            this.remote = machine;
          }
        } else if (!(this.to instanceof Machine)) {
          this.to = machine;
          if (machine.type === 'remote') {
            this.local = machine;
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
    // this.from = undefined;
    // this.to = undefined;
    // this.local = undefined;
    // this.remote = undefined;

    // this.fromLabel = '';
    // this.toLabel = '';
    // this.remoteLabel = '';
    // this.remoteMachine = null;
    this.command = {};
    this.commandEffect = {};
    // this.base = {};
    this.path = {};
    this.pattern = {};
  }

  // get userHost(): string {
  //   const {username, host} = this.remoteMachine.ssh;
  //   return `${username}@${host}`;
  // }

  get _machines(): Array<Machine> {
    return [this.from, this.to];
  }

  get identifyFile(): string {
    return this.remoteMachine.identifyFile;
  }

  get rsyncCommand(): string {
    const fromLabel = this.from.label;
    const from = this.from.ensureSyncPath(this.path[fromLabel]);
    const toLabel = this.to.label;
    const to = this.to.ensureSyncPath(this.path[toLabel]);

    return new Rsync()
      .shell(`ssh -i ${this.identifyFile}`)
      .flags('arv')
      .set('delete')
      .source(from)
      .destination(to)
      .command();
  }

  exec(command) {
    console.log(9);
  }

  sync() {
    const command = new Command(this.rsyncCommand);
    comamnd.exec();
  }

  async process() {
    if (!this.executedBeforeOnce) {
      await this.exec(this.command.BeforeOnce);
    }
    await this.exec(this.command.Before);
    await this.exec(this.command.After);
    if (!this.executedAfterOnce) {
      await this.exec(this.command.AfterOnce);
    }
  }
  //
  // hasBeforeOnceCommand() {
  //   return Boolean(this.comamnd.beforeOnce);
  // }
  //
  // effectForBeforeOnce() {
  //   const effect = new CommandEffect(this);
  //   this.commandEffect.beforeOnce = effect;
  //   return effect;
  // }
  //
  // beforeOnce([command]) {
  //   if (!this.valid()) {
  //     throw new Error('Local or remote path setting is not yet');
  //   }
  //   this.command.beforeOnce = command;
  //   this.effect = this.effectForBeforeOnce;
  //   return this;
  // }
  //
  // hasBeforeCommand() {
  //   return Boolean(this.comamnd.before);
  // }
  //
  // effectForBefore() {
  //   const effect = new CommandEffect(this);
  //   this.commandEffect.before = effect;
  //   return effect;
  // }
  //
  // before([command]) {
  //   if (!this.valid()) {
  //     throw new Error('Local or remote path setting is not yet');
  //   }
  //   this.command.before = command;
  //   this.effect = this.effectForBefore;
  //   return this;
  // }
  //
  // hasAfterOnceCommand() {
  //   return Boolean(this.comamnd.afterOnce);
  // }
  //
  // effectForAfterOnce() {
  //   const effect = new CommandEffect(this);
  //   this.commandEffect.afterOnce = effect;
  //   return effect;
  // }
  //
  // afterOnce([command]) {
  //   if (!this.valid()) {
  //     throw new Error('Local or remote path setting is not yet');
  //   }
  //   this.command.afterOnce = command;
  //   this.effect = this.effectForAfterOnce;
  //   return this;
  // }
  //
  // hasAfterCommand() {
  //   return Boolean(this.comamnd.after);
  // }
  //
  // effectForAfter() {
  //   const effect = new CommandEffect(this);
  //   this.commandEffect.after = effect;
  //   return effect;
  // }
  //
  // after([command]) {
  //   if (!this.valid()) {
  //     throw new Error('Local or remote path setting is not yet');
  //   }
  //   this.command.after = command;
  //   this.effect = this.effectForAfter;
  //   return this;
  // }
  //
  // set(label, base) {
  //   this.base[label] = base;
  //   this.addTemplateLiteral(label);
  // }
  //
  // addTemplateLiteral(label: string) {
  //   this[label] = ([_path]) => {
  //     if (label !== 'local' && this.remoteLabel !== '') {
  //       throw new Error(`Already set up remote to ${this.toLabel}`);
  //     } else if (label !== 'local' && this.remoteLabel === '') {
  //       this.remoteLabel = label;
  //     }
  //
  //     if (this.fromLabel === '') {
  //       this.fromLabel = label;
  //     } else if (this.toLabel === '') {
  //       this.toLabel = label;
  //     }
  //
  //     this.path[label] = path.join(this.base[label], (_path || ''));
  //     this.pattern[label] = path.join(this.path[label], '**/*');
  //     return this;
  //   };
  // }
  //
  // // get localPath() {
  // //   return path.join(this._base.local, this._local || '');
  // // }
  // //
  // // get localPattern() {
  // //   return path.join(this._base.local, this._local || '', '**/*');
  // // }
  // //
  // // get remotePath() {
  // //   return `${this._ssh.username}@${this._ssh.host}:` +
  // //          path.join(this._base.remote, this._remote || '');
  // // }
  // //
  // // get remotePattern() {
  // //   return path.join(this._base.remote, this._remote || '', '**/*');
  // // }
  // //
  // // label([label]) {
  // //   this._label = label;
  // // }
  // //
  // // local([local]) {
  // //   this._local = local;
  // //   if (this._remote === null) {
  // //     this.main = 'local';
  // //   }
  // //   return this;
  // // }
  // //
  // // remote([remote]) {
  // //   this._remote = remote;
  // //   if (this._local === null) {
  // //     this.main = 'remote';
  // //   }
  // //   return this;
  // // }
  //
  // valid() {
  //   if (this.local === null || this.remote === null) {
  //     throw new Error('Specify local and remote path');
  //   }
  //   return true;
  // }

  // hasBeforeSync() {
  //   return this._beforeSyncCommands !== null;
  // }
  //
  // get beforeSyncCommands() {
  //   if (typeof this._beforeSyncCommands === 'string') {
  //     return commandsFlatten(this._beforeSyncCommands.split('\n'));
  //   }
  //   return commandsFlatten(this._beforeSyncCommands);
  // }
  //
  // beforeSync(commands) {
  //   if (this.valid()) {
  //     this._beforeSyncCommands = commands;
  //   }
  //   return this;
  // }
  //
  // hasBeforeSyncOnce() {
  //   return this._beforeSyncOnceCommands !== null;
  // }
  //
  // get beforeSyncOnceCommands() {
  //   if (typeof this._beforeSyncOnceCommands === 'string') {
  //     return commandsFlatten(this._beforeSyncOnceCommands.split('\n'));
  //   }
  //   return commandsFlatten(this._beforeSyncOnceCommands);
  // }
  //
  // beforeSyncOnce(commands) {
  //   if (this.valid()) {
  //     this._beforeSyncOnceCommands = commands;
  //   }
  //   return this;
  // }
  //
  // hasAfterSync() {
  //   return this._afterSyncCommands !== null;
  // }
  //
  // get afterSyncCommands() {
  //   if (typeof this._afterSyncCommands === 'string') {
  //     return commandsFlatten(this._afterSyncCommands.split('\n'));
  //   }
  //   return commandsFlatten(this._afterSyncCommands);
  // }
  //
  // afterSync(commands) {
  //   if (this.valid()) {
  //     this._afterSyncCommands = commands;
  //   }
  //   return this;
  // }
  //
  // hasAfterSyncOnce() {
  //   return this._afterSyncOnceCommands !== null;
  // }
  //
  // get afterSyncOnceCommands() {
  //   if (typeof this._afterSyncOnceCommands === 'string') {
  //     return commandsFlatten(this._afterSyncOnceCommands.split('\n'));
  //   }
  //   return commandsFlatten(this._afterSyncOnceCommands);
  // }
  //
  // afterSyncOnce(commands) {
  //   if (this.valid()) {
  //     this._afterSyncOnceCommands = commands;
  //   }
  //   return this;
  // }
}
