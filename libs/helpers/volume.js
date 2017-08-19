import path from 'path';

export default class Volume {
  constructor(ssh, base = {local: '/', remote: '/'}) {
    this._ssh = ssh;
    this._base = base;
    this._base.local = base.local || '/';
    this._base.remote = base.remote || '/';
    this._main = null;
    this._label = null;
    this._local = null;
    this._remote = null;
    this._beforeSyncCommands = null;
    this._afterSyncCommands = null;
  }

  get localPath() {
    return path.join(this._base.local, this._local || '');
  }

  get localPattern() {
    return path.join(this._base.local, this._local || '', '**/*');
  }

  get remotePath() {
    // console.log(this._ssh);w
    return `${this._ssh.username}@${this._ssh.host}:` +
           path.join(this._base.remote, this._remote || '');
          //  ` -i ${this._ssh.identifyFile}`;
  }

  get remotePattern() {
    return path.join(this._base.remote, this._remote || '', '**/*');
  }

  label([label]) {
    this._label = label;
  }

  local([local]) {
    this._local = local;
    if (this._remote === null) {
      this._main = 'local';
    }
    return this;
  }

  remote([remote]) {
    this._remote = remote;
    if (this._local === null) {
      this._main = 'remote';
    }
    return this;
  }

  valid() {
    if (this.local === null || this.remote === null) {
      throw new Error('Specify local and remote path');
    }
    return true;
  }

  get beforeSyncCommands() {
    if (typeof this._beforeSyncCommands === 'string') {
      return this._beforeSyncCommands.split('\n');
    }
    return this._beforeSyncCommands;
  }

  beforeSync(commands) {
    if (this.valid()) {
      this._beforeSyncCommands = commands;
    }
    return this;
  }

  hasAfterSync() {
    return this._afterSyncCommands !== null;
  }

  get afterSyncCommands() {
    if (typeof this._afterSyncCommands === 'string') {
      return this._afterSyncCommands.split('\n');
    }
    return this._afterSyncCommands;
  }

  afterSync(commands) {
    if (this.valid()) {
      this._afterSyncCommands = commands;
    }
    return this;
  }
}
