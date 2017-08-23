import fs from 'fs';
import {promisify} from 'util';
import EventEmitter from 'events';
import {h, render} from 'ink';
import pProps from 'p-props';
import arrify from 'arrify';
import RemonadeComponent from 'components/remonade';
import Volume from 'helpers/volume';

// import {
//   viewSshHostname,
//   viewSshPort,
//   viewSshUser,
//   viewSshIdentifyFile,
//   viewBaseLocal,
//   viewBaseRemote
// } from 'helpers/config';
//
// function local(volume, localPath) {
//   return volume.local(localPath);
// }
// function remote(config, remotePath) {
//   return volume.remote(remotePath);
// }

export default class Remonade extends EventEmitter {
  static async adaptConfig(config = {}) {
    const base = config.base || process.cwd();
    const remotes = await Promise.all(
      arrify(config.remotes).map((remoteOpts, i) => {
        const {
          label,
          base: _base,
          ssh
        } = remoteOpts;
        if (!Object.prototype.hasOwnProperty.call(remoteOpts, 'label')) {
          throw new Error(`\`label\` is required to \`remotes[${i}]\``);
        }

        if (!Object.prototype.hasOwnProperty.call(ssh, 'identifyFile')) {
          throw new Error(`\`identifyFile\` is required to \`remotes[${i}]\``);
        }

        return pProps({
          label,
          base: (_base || null),
          ssh: pProps({
            ...(ssh || {}),
            privateKey: promisify(fs.readFile)(ssh.identifyFile)
          })
        });
      })
    );

    const volumes = await Promise.all(
      arrify(config.volumes).map(async volumeFn => {
        if (typeof volumeFn !== 'function') {
          throw new Error('`volume` isn\'t function');
        }

        const volume = new Volume();
        volume.set('local', base);
        remotes.forEach(remote => {
          volume.set(remote.label, remote.base);
        });

        await volumeFn(volume);
        return volume;
      })
    );

    const result = await pProps({
      base,
      remotes,
      volumes
    });
    return result;
  }

  constructor(config = {}) {
    super();
    this.config = config;
  }

  start() {
    render(<RemonadeComponent {...this.config}/>);
  }
}

process.on('unhandledRejection', console.dir);
