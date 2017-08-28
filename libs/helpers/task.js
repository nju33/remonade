/* @flow */

import {promisify} from 'util';
import EventEmitter from 'events';
import ssh from 'ssh2';
import bind from 'lodash-decorators/bind';
import Ssh from 'helpers/ssh';
import Volume from 'helpers/volume';

const {Client} = ssh;

export default class Task extends EventEmitter {
  immidiate: boolean;
  workdir: string;
  command: string;
  volume: ?Volume;
  ssh: Ssh;

  constructor(
    immidiate: boolean,
    workdir: string,
    command: string,
  ) {
    super();
    this.immidiate = immidiate;
    this.workdir = workdir;
    this.command = command;
  }

  associate(volume: Volume): Task {
    this.volume = volume;
    return this;
  }

  @bind()
  _handleReady(): void {
    this.emit('ready');
  }

  @bind()
  _handleEnd(): void {
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

  @bind()
  _handleChokidarReady(): void {
    this.emit('data', 'REMONADE_CHOKIDAR:READY');
  }

  @bind()
  _handleChokidarChange(): void {
    this.emit('data', 'REMONADE_CHOKIDAR:CHANGE');
  }

  process(ssh: Ssh): Task {
    const conn = new Client();

    if (typeof this.command === 'function') {
      this.command()
        .on('ready', this._handleChokidarReady)
        .on('change', this._handleChokidarChange);
      return this;
    }

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
