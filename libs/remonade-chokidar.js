#!/usr/bin/env node

import yargs from 'yargs';
import chokidar from 'chokidar';

const flags = yargs
  .option('pattern', {
    default: null
  })
  .argv;

chokidar.watch(flags.pattern)
  .on('change', () => {
    console.log('CHANGED');
  });
