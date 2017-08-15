// import fs from 'fs';
// import {promisify} from 'util';
import path from 'path';
import yargs from 'yargs';
import Liftoff from 'liftoff';
import interpret from 'interpret';
import minimist from 'minimist';
import Remonade from '.';

const argv = minimist(process.argv.slice(2));
// const flags = yargs
//   .option('config', {
//     alias: 'c',
//     default: 'remonade.config.js'
//   })
//   .argv;
const cli = new Liftoff({
  name: 'remonade',
  configName: 'remonade.config',
  extensions: interpret.jsVariants
});

console.log(argv);

cli.launch({
  cwd: argv.cwd,
  configPath: argv.gulpfile,
  require: argv.require,
  completion: argv.completion,
}, env => {
  const config = (config => {
    if (Object.prototype.hasOwnProperty.call(config, 'default')) {
      return config.default;
    }
    return config;

  })(require(env.configPath));
  Remonade.render(config);
})

// (async () => {
//   // const config = await promisify(fs.readFile)(flags.config, 'utf-8');
//   // const config = require(path.resolve(__dirname, flags.config));
//   console.log(config);
// })();
