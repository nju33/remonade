import {promisify} from 'util';
import EventEmitter from 'events';

export default class Command extends EventEmitter {
  constructor(command) {
    super();
    this.command = command;
    this.stream = null;
  }

  run(conn, sshConfig) {
    return new Promise((resolve, reject) => {
      conn.on('ready', async () => {
        const stack = [];
        try {
          const exec = conn.exec.bind(conn);
          this.stream = await promisify(exec)(this.command);
          this.stream.on('data', raw => {
            stack.push(raw.toString().replace(/\s*$/, ''));
            process.nextTick(() => {
              if (stack.length > 2) {
                this.emit('log', stack);
                stack.length = 0;
              }
            });
          })
          resolve(this.stream);
        } catch (err) {
          reject(err);
        }
      });
      conn.connect(sshConfig);
    });
  }
}
