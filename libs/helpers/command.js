import {promisify} from 'util';
import EventEmitter from 'events';
import ssh from 'ssh2';
import bind from 'lodash-decorators/bind';

const {Client} = ssh;


export default class Command extends EventEmitter {
  constructor(command, stderr = true) {
    super();
    this.command = command;
    this.stderr = stderr;
    // this.stream = null;
  }

  @bind()
  _handleEnd() {
    conn.end();
    this.emit('end');
  }

  @bind()
  _handleClose() {
    conn.end();
    this.emit('close');
  }

  @bind()
  _handleData(data) {
    this.emit('data', data);
  }

  @bind()
  _handleErrorData(data) {
    this.emit('error', data);
  }

  exec(machine) {
    const conn = new Client();

    return new Promise((resolve, reject) => {
      conn.on('ready', async () => {
        this.emit('run', this);
        const exec = conn.exec.bind(conn);
        try {
          const stream = await promisify(exec)(`
            (
              cd ${volume.base.remote} &&
              ${this.command}
            )
          `);

          stream
            .on('end', this._handleEnd)
            .on('close', this._handleClose)
            .on('data', this._handleData)
            .stderr.on('data', this.stderr ? this._handleErrorData : () => {});
          resolve(stream);
        } catch (err) {
          reject(err);
        }
      });
      conn.connect(machine.ssh);
    });
  }
}
