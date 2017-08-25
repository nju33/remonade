/* @flow */

import * as React from 'react';
import EventEmitter from 'events';
import {h, render} from 'ink';
import pProps from 'p-props';
import arrify from 'arrify';
import RemonadeComponent from 'components/remonade';
import Ssh from 'helpers/ssh';
import Machine from 'helpers/machine';
import Volume from 'helpers/volume';

export default class Remonade extends EventEmitter {
  config: Config

  static async adaptConfig(config: ArgumentConfig) {
    const base = config.base || process.cwd();
    const localMachine = new Machine('local', base);

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
          const ssh = new Ssh(opts.ssh);
          const machineConfig = await pProps({
            label,
            base: opts.base || null,
            ssh: ssh.init()
          });

          return new Machine(machineConfig);
        })
    );

    const volumes = await Promise.all(
      arrify(config.volumes).map(async volumeFn => {
        if (typeof volumeFn !== 'function') {
          throw new Error('`volume` isn\'t function');
        }

        const volume = new Volume([localMachine, ...machines]);
        machines.forEach(machine => volume.set(machine));

        await volumeFn(volume);
        return volume;
      })
    );

    const result = await pProps({
      base,
      machines,
      volumes
    });
    return result;
  }

  constructor(config: Config) {
    super();
    this.config = config;

    console.log(config);
    process.exit(0);
  }

  start() {
    render(<RemonadeComponent {...this.config}/>);
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
