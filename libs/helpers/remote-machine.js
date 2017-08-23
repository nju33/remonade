import fs from 'fs';
import {promisify} from 'util';
import pSeries from 'p-series';
import ssh from 'ssh2';
import Command from 'helpers/command';

const {Client} = ssh;

export default class RemoteMachine {
  constructor(remoteConfig) {
    const {base, ssh} = remoteConfig;
    this.base = base;
    this.ssh = ssh;
  }

  // constructor(sshConfig, remoteBase) {
  //   this._sshConfig = sshConfig;
  //   this._remoteBase = remoteBase
  //   this._commands = [];
  // }

  async runCommands(commands = []) {
    const results = await Promise.all(commands.map(command => {
      const conn = new Client();
      try {
        command.run(conn, this._sshConfig, this._remoteBase);
      } catch (err) {
        console.error(err);
      }
    }));
    this._commands = results;
    return this._commands;
  }
}
