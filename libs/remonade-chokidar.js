#!/usr/bin/env node
/* @flow */

import yargs from 'yargs';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';

const flags = yargs
  .option('pattern', {
    default: null
  })
  .argv;

chokidar.watch(flags.pattern)
  .on('ready', debounce(() => {
    console.log('REMONADE_CHOKIDAR:READY');
  }, 100))
  .on('add', debounce(() => {
    console.log('REMONADE_CHOKIDAR:ADD');
  }, 100))
  .on('change', debounce(() => {
    console.log('REMONADE_CHOKIDAR:CHANGE');
  }, 100));
