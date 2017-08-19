#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';
import Liftoff from 'liftoff';
import interpret from 'interpret';
import minimist from 'minimist';
import Remonade from '.';

const argv = minimist(process.argv.slice(2));
const cli = new Liftoff({
  name: 'remonade',
  configName: 'remonade.config',
  extensions: interpret.jsVariants
});

cli.launch({
  cwd: argv.cwd,
  configPath: argv.gulpfile,
  require: argv.require,
  completion: argv.completion,
}, async env => {
  const config = await (async config => {
    let result = null;
    if (Object.prototype.hasOwnProperty.call(config, 'default')) {
      result = await Remonade.adaptConfig(config.default);
    } else {
      result = await Remonade.adaptConfig(config);
    }
    return result;
  })(require(env.configPath));

  const proc = new Remonade(config);
  proc.start();
});
