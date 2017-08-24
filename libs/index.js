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

// import {
//   viewSshHostname,
//   viewSshPort,
//   viewSshUser,
//   viewSshIdentifyFile,
//   viewBaseLocal,
//   viewBaseRemote
// } from 'helpers/config';

export default class Remonade extends EventEmitter {
  config: Config

  static async adaptConfig(config: ArgumentConfig) {
    const base = config.base || process.cwd();
    const machines = await Promise.all(
      arrify(config.machines)
        .map((() => {
          let existsLocal = false;
          return opts => {
            if (typeof opts.ssh !== 'object' && existsLocal) {
              throw new Error('There are two or more local machine settings');
            }

            if (typeof opts.ssh === 'object') {
              opts.type = 'remote';
            } else {
              opts.type = 'local';
              existsLocal = true;
            }
            return opts;
          };
        })())
        .map(async (opts, i) => {
          if (!Object.prototype.hasOwnProperty.call(opts, 'label')) {
            throw new Error(`\`label\` is required to \`remotes[${i}]\``);
          }

          if (Object.prototype.hasOwnProperty.call(opts, 'ssh')) {
            const {ssh} = opts;
            if (!Object.prototype.hasOwnProperty.call(ssh, 'identifyFile')) {
              throw new Error(`\`identifyFile\` is required to \`remotes[${i}]\``);
            }
          }

          const ssh = new Ssh(opts.ssh);

          const machineConfig = await pProps({
            label: opts.label,
            base: (opts.base || null),
            ssh: opts.ssh ?
                   new Ssh(opts.ssh).init() :
                   Promise.resolve(undefined)
          });

          return new Machine(machineConfig);
        })
    );

    const volumes = await Promise.all(
      arrify(config.volumes).map(async volumeFn => {
        if (typeof volumeFn !== 'function') {
          throw new Error('`volume` isn\'t function');
        }

        const volume = new Volume(machines);
        // machines.forEach(machine => volume.set(machine));

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
