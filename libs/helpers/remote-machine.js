import fs from 'fs';
import {promisify} from 'util';
import pSeries from 'p-series';
import ssh from 'ssh2';
import Command from 'helpers/command';

const {Client} = ssh;

export default class RemoteMachine {
  constructor(sshConfig = {}) {
    this.sshConfig = sshConfig;
    this.command = null;
  }

  async makeCommand() {
    const conn = new Client();
    try {
      const stream = await (() => {
        return new Promise((resolve, reject) => {
          conn.on('ready', () => {
            conn.shell((err, stream) => {
              if (err) {
                console.log(err);
                return reject(err);
              }
              return resolve(stream);
            });
          });
          conn.connect(this.sshConfig);
        });
      })();

      this.command = new Command(stream);
      return this.command;
    } catch (err) {
      console.error(err);
    }
  }
}
