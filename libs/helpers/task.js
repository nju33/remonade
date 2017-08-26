/* @flow */

import {promisify} from 'util';
import EventEmitter from 'events';
import ssh from 'ssh2';
import bind from 'lodash-decorators/bind';
import Ssh from 'helpers/ssh';

const {Client} = ssh;

export default class Task extends EventEmitter {
  immidiate: boolean;
  workdir: string;
  command: string;
  ssh: Ssh;

  constructor(immidiate: boolean, workdir: string, command: string) {
    super();
    this.immidiate = immidiate;
    this.workdir = workdir;
    this.command = command;
  }

  @bind()
  _handleEnd() {
    this.emit('end');
  }

  @bind()
  _handleData(data: Blob): void {
    this.emit('data', data.toString());
  }

  @bind()
  _handleError(data: Blob): void {
    this.emit('error', data.toString());
  }

  process(ssh: Ssh): Promise<*> {
    const conn = new Client();
    console.log(11999);
    return new Promise((resolve, reject) => {
      conn.on('ready', async () => {
        this.emit('ready', this);
        console.log(999);
        const exec = conn.exec.bind(conn);
        try {
          const stream = await promisify(exec)(`
            (
              cd ${this.workdir} &&
              ${this.command}
            )
          `);

          stream
            .on('ready', resolve)
            .on('data', this._handleData)
            .on('end', this._handleEnd)
            .stderr
              .on('data', this._handleError);
        } catch (err) {
          reject(err);
        }
      });

      conn.connect(ssh);
    });

  }
}