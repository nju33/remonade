import {promisify} from 'util';
import EventEmitter from 'events';

export default class Command extends EventEmitter {
  constructor(command, stderr = true) {
    super();
    this.command = command;
    this.stderr = stderr;
    this.stream = null;
  }

  run(conn, sshConfig) {
    return new Promise((resolve, reject) => {
      conn.on('ready', async () => {
        // const stack = [];
        try {
          this.emit('run', this);
          const exec = conn.exec.bind(conn);
          this.stream = await promisify(exec)(`
            (
              cd remotes/remonade &&
              ${this.command}
            )
          `);

          this.stream
            .on('end', () => {
              return conn.end();
              this.emit('end');
            })
            .on('close', () => {
              return conn.end();
              this.emit('close');
            })
            .on('data', data => {
              this.emit('data', data);
            });

          if (this.stderr) {
            this.stream.stderr.on('data', data => {
              this.emit('data', data);
              this.emit('err', data);
            })
          }
            // .stderr.on('data', data => {
            //   console.log(data.toString());
            // });

            // stack.push(raw.toString().replace(/\s*$/, ''));
            // process.nextTick(() => {
            //   if (stack.length > 2) {
            //     this.emit('data', stack);
            //     stack.length = 0;
            //   }
            // });
          // });
          resolve(this.stream);
        } catch (err) {
          reject(err);
        }
      });
      conn.connect(sshConfig);
    });
  }
}
