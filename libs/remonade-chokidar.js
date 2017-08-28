#!/usr/bin/env node

import yargs from 'yargs';
import chokidar from 'chokidar';

const flags = yargs
  .option('pattern', {
    default: null
  })
  .argv;

chokidar.watch(flags.pattern)
  .on('ready', () => {
    console.log('REMONADE_CHOKIDAR:READY');
  })
  .on('add', () => {
    console.log('REMONADE_CHOKIDAR:ADD');
  })
  .on('change', () => {
    console.log('REMONADE_CHOKIDAR:CHANGE');
  });
