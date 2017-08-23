import RsyncPkg from 'rsync';

export default class Rsync {
  constructor(volume) {
    this._volume = volume;

    const {ssh} = volume.remoteMachine;
    const preRemote = `${ssh.username}@${ssh.host}`;
    this._rsync = new RsyncPkg()
      .shell(`ssh -i ${ssh.identifyFile}`)
      .flags('arv')
      .set('delete');

    if (volume.remoteLabel === 'local') {
      this._rsync
        .source(volume.path[volume.fromLabel])
        .destination(`${preRemote}:${volume.path[volume.toLabel]}`);
    } else {
      this._rsync
        .source(`${preRemote}:${volume.path[volume.fromLabel]}`)
        .destination(volume.path[volume.toLabel]);
    }
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
