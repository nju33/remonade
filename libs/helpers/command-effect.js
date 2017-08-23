export default class CommandEffect {
  constructor(volume) {
    this._volume = volume;
    this.handleClose = null;
    this.handleError = null;
  }

  end() {
    return this._volume;
  }

  onClose(handle) {
    this.handleClose = handle;
    return this;
  }

  onError(handle) {
    this.handleError = handle;
    return this;
  }
}
