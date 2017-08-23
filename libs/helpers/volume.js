import path from 'path';
import R from 'ramda';
import CommandEffect from 'helpers/command-effect';
import commandsFlatten from 'helpers/commands-flatten';

export default class Volume {
  constructor(ssh, base = {local: '/', remote: '/'}) {
    // this.main = null;
    // this._ssh = ssh;
    // this._base = base;
    // this._base.local = base.local || '/';
    // this._base.remote = base.remote || '/';
    // this._label = null;
    // this._local = null;
    // this._remote = null;
    // this._beforeSyncCommands = null;
    // this._beforeSyncOnceCommands = null;
    // this._afterSyncCommands = null;
    // this._afterSyncOnceCommands = null;
    // this.executedBeforeSyncOnce = false;
    // this.executedAfterSyncOnce = false;

    this._remote = '';
    this.command = {
      beforeOnce: null,
      before: null,
      afterOnce: null,
      after: null
    };
    this.commandEffect = {
      beforeOnce: null,
      before: null,
      afterOnce: null,
      after: null
    };
    this.base = {};
    this.path = {};
    this.pattern = {};
  }

  hasBeforeOnceCommand() {
    return Boolean(this.comamnd.beforeOnce);
  }

  effectForBeforeOnce() {
    const effect = new CommandEffect(this);
    this.commandEffect.beforeOnce = effect;
    return effect;
  }

  beforeOnce([command]) {
    if (!this.valid()) {
      throw new Error('Local or remote path setting is not yet');
    }
    this.command.beforeOnce = command;
    this.effect = this.effectForBeforeOnce;
    return this;
  }

  hasBeforeCommand() {
    return Boolean(this.comamnd.before);
  }

  effectForBefore() {
    const effect = new CommandEffect(this);
    this.commandEffect.before = effect;
    console.log(effect);
    return effect;
  }

  before([command]) {
    if (!this.valid()) {
      throw new Error('Local or remote path setting is not yet');
    }
    this.command.before = command;
    this.effect = this.effectForBefore;
    return this;
  }

  hasAfterOnceCommand() {
    return Boolean(this.comamnd.afterOnce);
  }

  effectForAfterOnce() {
    const effect = new CommandEffect(this);
    this.commandEffect.afterOnce = effect;
    return effect;
  }

  afterOnce([command]) {
    if (!this.valid()) {
      throw new Error('Local or remote path setting is not yet');
    }
    this.command.afterOnce = command;
    this.effect = this.effectForAfterOnce;
    return this;
  }

  hasAfterCommand() {
    return Boolean(this.comamnd.after);
  }

  effectForAfter() {
    const effect = new CommandEffect(this);
    this.commandEffect.after = effect;
    return effect;
  }

  after([command]) {
    if (!this.valid()) {
      throw new Error('Local or remote path setting is not yet');
    }
    this.command.after = command;
    this.effect = this.effectForAfter;
    return this;
  }

  set(label, base) {
    this.base[label] = base;
    this.addTemplateLiteral(label);
  }

  addTemplateLiteral(label) {
    this[label] = ([_path]) => {
      if (label !== 'local' && this._remote !== '') {
        throw new Error(`Already set up remote to ${this._remote}`);
      }

      if (label !== 'local') {
        this._remote = label;
      }

      this.path[label] = path.join(this.base[label], (_path || ''));
      this.pattern[label] = path.join(this.path[label], '**/*');
      return this;
    };
  }

  // get localPath() {
  //   return path.join(this._base.local, this._local || '');
  // }
  //
  // get localPattern() {
  //   return path.join(this._base.local, this._local || '', '**/*');
  // }
  //
  // get remotePath() {
  //   return `${this._ssh.username}@${this._ssh.host}:` +
  //          path.join(this._base.remote, this._remote || '');
  // }
  //
  // get remotePattern() {
  //   return path.join(this._base.remote, this._remote || '', '**/*');
  // }
  //
  // label([label]) {
  //   this._label = label;
  // }
  //
  // local([local]) {
  //   this._local = local;
  //   if (this._remote === null) {
  //     this.main = 'local';
  //   }
  //   return this;
  // }
  //
  // remote([remote]) {
  //   this._remote = remote;
  //   if (this._local === null) {
  //     this.main = 'remote';
  //   }
  //   return this;
  // }

  valid() {
    if (this.local === null || this.remote === null) {
      throw new Error('Specify local and remote path');
    }
    return true;
  }

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
