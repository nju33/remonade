export default class Volume {
  constructor() {
    // this.base = base;
    // this.base.local = base.local || '/';
    // this.base.remote = base.remote || '/';
    this.local = null;
    this.remote = null;
  }

  base() {}

  local(_local) {
    this.local = _local;
    return this;
  }

  remote(_remote) {
    this.remote = _remote;
    return this;
  }

  valid() {
    if (this.local === null || this.remote === null) {
      throw new Error('Specify local and remote path');
    }
    return true;
  }

  beforeSync() {
    if (this.valid()) {
      console.log(9);
    }
  }

  afterSync() {
    if (this.valid()) {
      console.log(1);
    }
  }
}
