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
    console.log('READY');
  })
  .on('add', () => {
    console.log('ADD');
  })
  .on('change', () => {
    console.log('CHANGED');
  });
