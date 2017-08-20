import chalk from 'chalk';

const re = /(\w+(?:\.[a-z]{1,}))/g;

export default value => {
  if (typeof value === 'string') {
    return value.replace(re, (_, p1) => (
      chalk.yellow(p1)
    ));
  }

  return value.map(item => (
    item.replace(re, (_, p1) => (
      chalk.yellow(p1)
    ))
  ));
};
