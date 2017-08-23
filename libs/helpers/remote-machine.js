import fs from 'fs';
import chalk from 'chalk';
import {promisify} from 'util';
import pSeries from 'p-series';
import ssh from 'ssh2';
import bind from 'lodash-decorators/bind';
import Command from 'helpers/command';
import exitHook from 'exit-hook';

const {Client} = ssh;

export default class RemoteMachine {
  constructor(remoteConfig) {
    const {label, base, ssh} = remoteConfig;
    this.label = label;
    this.base = base;
    this.ssh = ssh;
  }

  @bind()
  beforeExit(cb) {
    const killCommand = new Command('kill -9 -1', false);
    killCommand.on('end', cb);
    this.runCommands([killCommand]);
  }


  // constructor(sshConfig, remoteBase) {
  //   this._sshConfig = sshConfig;
  //   this._remoteBase = remoteBase
  //   this._commands = [];
  // }

  @bind()
  _handleRun(runner) {
    this.updateRemoteLog([chalk.gray(`$ ${runner.command}`)]);
    process.nextTick(resolve);
  }

  @bind()
  _handleData(line) {
    const chunk = cup.pour(line.toString().split('\n'));
    if (chunk.lenght === 0) {
      return;
    }
    this.updateRemoteLog(chunk);
  }

  @bind()
  _handleError(line) {
    const chunk = cup.pour(line.toString().split('\n'));
    if (chunk.lenght === 0) {
      return;
    }
    this.updateRemoteLog(chunk);
    process.nextTick(reject);
  }

  async runCommands(hookCommand) {
    const command = new Command(hookCommand);
    command
      .on('run', this._handleRun)
      .on('data', this._handleData)
      .on('error', this._handleError);

    exitHook(cb => {
      this.beforeExit(cb);
    });

    // const conn = new Client():
    try {
      command.run(this);
    } catch (err) {
      console.error(err);
    }

    return command;

    // const results = await Promise.all(commands.map(command => {
    //   const conn = new Client();
    //   try {
    //     command.run(conn, this._sshConfig, this._remoteBase);
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }));
    // this._commands = results;
    // return this._commands;
  }
}

// runCommands(hookCommands, remoteMachine, cup) {
//   return new Promise((resolve, reject) => {
//     const commands = hookCommands.map(line => {
//       const command = new Command(line);
//       command
//         .on('run', runner => {
//           this.updateRemoteLog([chalk.gray(`$ ${runner.command}`)]);
//
//           process.nextTick(resolve);
//         })
//         .on('data', line => {
//           const chunk = cup.pour(line.toString().split('\n'));
//           if (chunk.lenght === 0) {
//             return;
//           }
//           this.updateRemoteLog(chunk);
//         })
//         .on('error', line => {
//           const chunk = cup.pour(line.toString().split('\n'));
//           if (chunk.lenght === 0) {
//             return;
//           }
//           this.updateRemoteLog(chunk);
//
//           process.nextTick(reject);
//         });
//
//       exitHook(cb => {
//         this.beforeExit(cb, remoteMachine, command);
//       });
//       return command;
//     });
//     remoteMachine.runCommands(commands);
//   });
// }
