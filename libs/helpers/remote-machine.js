import fs from 'fs';
import {promisify} from 'util';
import pSeries from 'p-series';
import ssh from 'ssh2';
import Command from 'helpers/command';

const {Client} = ssh;

export default class RemoteMachine {
  constructor(sshConfig = {}) {
    this.sshConfig = sshConfig;
    this.commands = [];
  }

  async runCommands(commands = []) {
    const results = await Promise.all(commands.map(command => {
      const conn = new Client();
      try {
        command.run(conn, this.sshConfig);
      } catch (err) {
        console.error(err);
      }
    }));
    this.commands = results;
    return this.commands;
  }
}
