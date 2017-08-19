import RsyncPkg from 'rsync';

export default class Rsync {
  constructor(volume, ssh) {
    this._volume = volume;
    this._ssh = ssh;
    this._rsync = new RsyncPkg()
      .shell(`ssh -i ${ssh.identifyFile}`)
      .flags('arv')
      .set('delete')
      .source(volume.localPath)
      .destination(volume.remotePath);
  }

  get command() {
    return this._rsync.command();
  }

  get dryCommand() {
    return this._rsync
      .flags('n')
      .command();
  }
}
