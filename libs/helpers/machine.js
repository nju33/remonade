/* @flow */

import Ssh from 'helpers/ssh';
import type {SshProp} from 'helpers/ssh';
import Task from 'helpers/task';

export default class Machine {
  label: string;
  color: string | null;
  base: string | null;
  ssh: ?Ssh;
  tasks: Array<Task>;
  logs: Array<string>;

  constructor(label: string, color: ?string, base: ?string, ssh: ?Ssh) {
    this.label = label;
    this.color = color || null;
    this.base = base || null;
    if (typeof ssh !== 'undefined') {
      this.ssh = ssh;
    }
    this.tasks = [];
    this.logs = [];
  }

  addTask(task: Task): void {
    this.tasks.push(task)
  }

  log(logs: Array<string>): void {
    if (typeof logs === 'string') {
      logs = [logs];
    }
    this.logs = [...this.logs, ...logs];
  }

  get immidiatelyTasks(): Array<Task> {
    return this.tasks.filter(task => Boolean(task.immidiate));
  }

  get nonImmidiatelyTasks(): Array<Task> {
    return this.tasks.filter(task => !Boolean(task.immidiate));
  }

  runImmidiatelyTasks(): void {
    if (!this.ssh) {
      return;
    }

    this.immidiatelyTasks.forEach(task => {
      console.log(task);
      task.process((this: any).ssh);
      task.on('end', () => {
        console.log(9);
      })
      task.on('data', line => {
        console.log(line);
      });
      task.on('error', line => {
        console.log(line);
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
    return `${(this.ssh: SshProp).username}@${(this.ssh: SshProp).host}`;
  }

  get identifyFile(): string {
    if (!this.ssh) {
      throw new Error('Trying to remotely access it though it is local');
    }
    return (this.ssh: SshProp).identifyFile;
  }

  ensureSyncPath(dir: string): string {
    if (this.ssh) {
      return `${this.userHost}:${dir}`;
    }
    return dir;
  }
}
