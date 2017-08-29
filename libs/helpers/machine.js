/* @flow */

import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import {promisify} from 'util';
import Ssh from 'helpers/ssh';
import type {SshProp} from 'helpers/ssh';
import Task from 'helpers/task';
import exitHook from 'async-exit-hook';
import execa from 'execa';
import tmp from 'tmp';

export default class Machine extends EventEmitter {
  label: string;
  color: string | null;
  base: string;
  ssh: ?Ssh;
  tasks: Array<Task>;
  logs: Array<string>;
  logfilename: string;

  constructor(label: string, color: ?string, base: string, ssh: ?Ssh) {
    super();

    this.label = label;
    this.color = color || null;
    this.base = base;
    if (typeof ssh !== 'undefined') {
      this.ssh = ssh;
      exitHook(cb => {
        const exitTask = new Task(false, '/', 'kill -9 -1');
        try {
          exitTask.process((this.ssh: any)).on('end', cb);
        } catch (_) {}
      });
    }
    this.tasks = [];
    this.logs = [];
  }

  async init(dir: string): Promise<void> {
    const mkdir = promisify(tmp.dir);
    const mkfile = promisify(tmp.file);
    const filepath = await mkfile({
      prefix: this.label + '-',
      dir,
      postfix: '.log'
    });
    this.logfilename = filepath;
  }

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  async log(logs: Array<string>): Promise<void> {
    if (typeof logs === 'string') {
      logs = [logs];
    }
    this.logs = [...this.logs, ...logs];
    try {
      await promisify(fs.appendFile)(this.logfilename, logs.join('\n'))
    } catch (_) {}
  }

  get immidiatelyTasks(): Array<Task> {
    return this.tasks.filter(task => task.immidiate);
  }

  get nonImmidiatelyTasks(): Array<Task> {
    return this.tasks.filter(task => !task.immidiate);
  }

  runImmidiatelyTasks(): void {
    // if (!this.ssh) {
    //   return;
    // }
    this.immidiatelyTasks.forEach(task => {
      task.process((this: any).ssh || ({}: Ssh))
        .on('end', () => {
          this.emit('update');
        })
        .on('data', async line => {
          switch (line.trim()) {
          case 'REMONADE_CHOKIDAR:ADD': {
            return;
          }
          case 'REMONADE_CHOKIDAR:READY':
          case 'REMONADE_CHOKIDAR:CHANGE': {
            const tasks = this.tasks
              .filter(task => {
                const file = 'node_modules/bin/remonade-chokidar.js';
                return typeof task.command === 'function' ||
                       task.command.trim().startsWith(file);
              })
              .filter(task => task.immidiate);
            if (tasks.length > 0) {
              await Promise.all(
                tasks.map(async task => {
                  if (task.volume) {
                    const command = task.volume.rsyncCommand;
                    try {
                      const result = await execa.shell(command);
                      this.log('$ ' + command);
                      this.log(result.stdout);
                    } catch (err) {
                      throw new Error(err);
                    }
                  }
                })
              );
              this.runNonImmidiatelyTasks();
            }
            return;
          }
          default: {
            this.log(line);
          }
          }

          this.emit('update');
        })
        .on('error', line => {
          this.log(line);
          this.emit('update');
        });
    });
  }

  runNonImmidiatelyTasks(): void {
    this.nonImmidiatelyTasks.forEach(task => {
      this.log('$ ' + task.command);
      this.emit('update');
      task.process((this: any).ssh || ({}: Ssh))
        .on('end', () => {
          task.removeAllListeners();
        })
        .on('data', line => {
          this.log(line);
          this.emit('update');
        });
    });
  }

  get type(): string {
    return typeof this.ssh === 'undefined' ? 'local' : 'remote';
  }

  isLocal(): boolean {
    return this.type === 'local';
  }

  get userHost(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return `${(this.ssh: SshProp).user}@${(this.ssh: SshProp).hostname}`;
  }

  get identifyFile(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return (this.ssh: SshProp).identifyFile;
  }

  getRsyncPath(dir: string): string {
    if (this.ssh) {
      return `${this.userHost}:${dir}`;
    }
    return dir;
  }
}
