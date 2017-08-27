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
  endFlagPattern: RegExp | null
  ssh: Ssh;

  constructor(
    immidiate: boolean,
    workdir: string,
    command: string,
    endFlagPattarn: ?string
  ) {
    super();
    this.immidiate = immidiate;
    this.workdir = workdir;
    this.command = command;
    this.endFlagPattern = (() => {
      if (typeof endFlagPattarn === 'string') {
        return new RegExp(endFlagPattarn);
      }
      return null;
    })();
  }

  @bind()
  _handleReady() {
    this.emit('ready');
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

  process(ssh: Ssh): Task {
    const conn = new Client();

    conn.on('ready', async () => {
      this.emit('ready', this);
      const exec = conn.exec.bind(conn);
      try {
        const stream = await promisify(exec)(`
          (
            cd ${this.workdir} &&
            ${this.command}
          )
        `);

        stream
          .on('ready', this._handleReady)
          .on('data', this._handleData)
          .on('end', this._handleEnd)
          .stderr
            .on('data', this._handleError);
      } catch (err) {
        throw new Error(err);
      }
    });

    conn.connect(ssh);
    return this;
  }
}
