import path from 'path';
import R from 'ramda';
import trimMap from 'helpers/trim-map';

export default class Volume {
  constructor(ssh, base = {local: '/', remote: '/'}) {
    this.main = null;
    this._ssh = ssh;
    this._base = base;
    this._base.local = base.local || '/';
    this._base.remote = base.remote || '/';
    this._label = null;
    this._local = null;
    this._remote = null;
    this._beforeSyncCommands = null;
    this._beforeSyncOnceCommands = null;
    this._afterSyncCommands = null;
    this._afterSyncOnceCommands = null;
    this.executedBeforeSyncOnce = false;
    this.executedAfterSyncOnce = false;
  }

  get localPath() {
    return path.join(this._base.local, this._local || '');
  }

  get localPattern() {
    return path.join(this._base.local, this._local || '', '**/*');
  }

  get remotePath() {
    return `${this._ssh.username}@${this._ssh.host}:` +
           path.join(this._base.remote, this._remote || '');
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
      this.main = 'local';
    }
    return this;
  }

  remote([remote]) {
    this._remote = remote;
    if (this._local === null) {
      this.main = 'remote';
    }
    return this;
  }

  valid() {
    if (this.local === null || this.remote === null) {
      throw new Error('Specify local and remote path');
    }
    return true;
  }

  hasBeforeSync() {
    return this._beforeSyncCommands !== null;
  }

  get beforeSyncCommands() {
    if (typeof this._beforeSyncCommands === 'string') {
      return R.pipe(
        R.flatten,
        trimMap
      )(this._beforeSyncCommands.split('\n'));
    }
    return this._beforeSyncCommands;
  }

  beforeSync(commands) {
    if (this.valid()) {
      this._beforeSyncCommands = commands;
    }
    return this;
  }

  hasBeforeSyncOnce() {
    return this._beforeSyncOnceCommands !== null;
  }

  get beforeSyncOnceCommands() {
    if (typeof this._beforeSyncOnceCommands === 'string') {
      return R.pipe(
        R.flatten,
        trimMap
      )(this._beforeSyncOnceCommands.split('\n'));
    }
    return this._beforeSyncOnceCommands;
  }

  beforeSyncOnce(commands) {
    if (this.valid()) {
      this._beforeSyncOnceCommands = commands;
    }
    return this;
  }

  hasAfterSync() {
    return this._afterSyncCommands !== null;
  }

  get afterSyncCommands() {
    if (typeof this._afterSyncCommands === 'string') {
      return R.pipe(
        R.flatten,
        trimMap
      )(this._afterSyncCommands.split('\n'));
    }
    return this._afterSyncCommands;
  }

  afterSync(commands) {
    if (this.valid()) {
      this._afterSyncCommands = commands;
    }
    return this;
  }

  hasAfterSyncOnce() {
    return this._afterSyncOnceCommands !== null;
  }

  get afterSyncOnceCommands() {
    if (typeof this._afterSyncOnceCommands === 'string') {
      return R.pipe(
        R.flatten,
        trimMap
      )(this._afterSyncOnceCommands.split('\n'));
    }
    return this._afterSyncOnceCommands;
  }

  afterSyncOnce(commands) {
    if (this.valid()) {
      this._afterSyncOnceCommands = commands;
    }
    return this;
  }
}
