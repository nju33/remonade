/* @flow */

import path from 'path';
import * as React from 'react';
import EventEmitter from 'events';
import {h, render} from 'ink';
// import pProps from 'p-props';
import arrify from 'arrify';
import RemonadeComponent from 'components/remonade';
import Ssh from 'helpers/ssh';
import Machine from 'helpers/machine';
import Volume from 'helpers/volume';
import Task from 'helpers/task';
// import debounce from 'lodash.debounce';

export default class Remonade extends EventEmitter {
  config: Config

  static async adaptConfig(config: ArgumentConfig) {
    const base = config.base || process.cwd();
    const localMachine = new Machine('local', config.color, base);

    const machineEntries = Object.entries(config.machines || {});
    const machines = await Promise.all(
      arrify(machineEntries)
        .map(pairs => {
          const opts = pairs[1];
          if (typeof opts.ssh !== 'object') {
            throw new Error('`.ssh` is required to machines');
          }
          if (typeof opts.ssh.identifyFile !== 'string') {
            throw new Error('`.ssh.identifyFile` is required to machines');
          }
          return pairs;
        })
        .map(async pairs => {
          const [label, opts] = pairs;
          const ssh = await (new Ssh(opts.ssh)).init();
          // const machineConfig = await pProps({
          //   label,
          //   tasks:
          //   base: opts.base || null,
          //   ssh: ssh.init()
          // });

          const machine = new Machine(label, opts.color, opts.base, ssh);
          opts.tasks.forEach(task => {
            const workdir = (() => {
              if (machine.base === null) {
                if (!task.workdir) {
                  throw new Error('Set either `machine.base` or `task.workdir`');
                }
                return task.workdir;
              }
              return path.join(machine.base, task.workdir || '.');
            })();
            machine.addTask(new Task(
              task.immidiate,
              workdir,
              task.command
            ));
          });
          return machine;
        })
    );

    const volumes = await Promise.all(
      arrify(config.volumes).map(async volumeFn => {
        if (typeof volumeFn !== 'function') {
          throw new Error('`volume` isn\'t function');
        }

        const volume = new Volume([localMachine, ...machines]);
        // machines.forEach(machine => volume.set(machine));

        await volumeFn(volume);
        return volume;
      })
    );

    volumes.forEach(volume => {
      if (volume.from.isLocal()) {
        const task = new Task(
          true,
          localMachine.base,
          volume._watchFiles
        );
        task.associate(volume);
        localMachine.tasks.push(task);
      } else {
        const target = machines.find(m => m === volume.from);
        if (!target) {
          return;
        }

        const pattern = volume.pattern[target.label];
        const task = new Task(
          true,
          target.base,
          `node_modules/bin/remonade-chokidar.js --pattern ${pattern}`
        );
        task.associate(volume);
        target.tasks.push(task);
      }
    });

    const result = {
      machines: [localMachine, ...machines],
      volumes
    };
    return result;
  }

  constructor(config: Config) {
    super();
    this.config = config;
    debugger;
  }

  start() {
    render(<RemonadeComponent {...this.config}/>);

    // this.config.machines.forEach(machine => {
    //   machine.on('update', debounce(() => {
    //     render(<RemonadeComponent {...this.config}/>);
    //   }, 100));
    // });
  }
}

process.on('unhandledRejection', console.dir);

// import {
//   viewSshHostname,
//   viewSshPort,
//   viewSshUser,
//   viewSshIdentifyFile,
//   viewBaseLocal,
//   viewBaseRemote
// } from 'helpers/config';
