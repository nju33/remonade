// import path from 'path';
import {h, Component /* , Text */} from 'ink';
import PropTypes from 'prop-types';
import chokidar from 'chokidar';
import termSize from 'term-size';
import execa from 'execa';
import debounce from 'lodash.debounce';
import chalk from 'chalk';
import exitHook from 'async-exit-hook';
import Subject from 'components/subject';
import Log from 'components/log';
import RemoteMachine from 'helpers/remote-machine';
import Command from 'helpers/command';
import Cup from 'helpers/cup';
import Rsync from 'helpers/rsync';

// const ADJUST_ROW_NUMBER = 4;

export default class Remonade extends Component {
  constructor(props) {
    super(props);

    const termSizeData = termSize();
    const remoteLength = props.remotes.length;
    this.state = {
      // rowLength: Math.floor((termSizeData.rows / 2) - ADJUST_ROW_NUMBER),
      rowLength: Math.floor((termSizeData.rows / 2) - remoteLength),
      colLength: termSizeData.columns,
      log: {
        local: [],
        remote: []
      }
    };
  }

  updateLocalLog(chunk) {
    if (chunk.length === 0) {
      return;
    }
    process.nextTick(() => {
      const nextLog = Object.assign({}, this.state.log);
      nextLog.local.push(...chunk);
      this.setState({log: nextLog});
    });
  }

  updateRemoteLog(chunk) {
    if (chunk.length === 0) {
      return;
    }
    process.nextTick(() => {
      const nextLog = Object.assign({}, this.state.log);
      nextLog.remote.push(...chunk);
      this.setState({log: nextLog});
    });
  }

  // beforeExit(cb, remoteMachine, command) {
  //   const killCommand = new Command('kill -9 -1', false);
  //   killCommand.on('end', cb);
  //   remoteMachine.runCommands([killCommand]);
  // }

  render() {
    return (
      <div>
        <div>
          <Subject color="green">Local</Subject>
          <Log
            rowLength={this.state.rowLength}
            colLength={this.state.colLength}
            log={this.state.log.local}
          />
        </div>
        <div>
          <Subject color="red">Remote</Subject>
          <Log
            rowLength={this.state.rowLength}
            colLength={this.state.colLength}
            log={this.state.log.remote}
          />
        </div>
      </div>
    );
  }

  async execLocalSync(rsync, cup) {
    this.updateLocalLog([chalk.gray(`$ ${rsync.command}`)]);

    return new Promise(resolve => {
      execa
        .shell(rsync.command)
        .stdout.on('data', line => {
          const chunk = cup.pour(line.toString().split('\n'));
          this.updateLocalLog(chunk);
        })
        .on('close', () => {
          this.updateLocalLog(cup.data);
          resolve();
        });
    });
  }

  async execRemoteSync(rsync, cup) {
    this.updateRemoteLog([chalk.gray(`$ ${rsync.command}`)]);

    return new Promise(resolve => {
      execa
        .shell(rsync.command)
        .stdout.on('data', line => {
          const chunk = cup.pour(line.toString().split('\n'));
          this.updateRemoteLog(chunk);
        })
        .on('close', () => {
          this.updateRemoteLog(cup.data);
          resolve();
        });
    });
  }

  // runCommands(hookCommands, remoteMachine, cup) {
  //   return new Promise((resolve, reject) => {
  //     const commands = hookCommands.map(line => {
  //       const command = new Command(line);
  //       command
  //         .on('run', runner => {
  //           this.updateRemoteLog([chalk.gray(`$ ${runner.command}`)]);
  //
  //           process.nextTick(resolve);
  //         })
  //         .on('data', line => {
  //           const chunk = cup.pour(line.toString().split('\n'));
  //           if (chunk.lenght === 0) {
  //             return;
  //           }
  //           this.updateRemoteLog(chunk);
  //         })
  //         .on('error', line => {
  //           const chunk = cup.pour(line.toString().split('\n'));
  //           if (chunk.lenght === 0) {
  //             return;
  //           }
  //           this.updateRemoteLog(chunk);
  //
  //           process.nextTick(reject);
  //         });
  //
  //       exitHook(cb => {
  //         this.beforeExit(cb, remoteMachine, command);
  //       });
  //       return command;
  //     });
  //     remoteMachine.runCommands(commands);
  //   });
  // }

  handleLocal(volume, rsync, cup) {
    const watcher = chokidar.watch(volume.localPattern, {});
    const handle = async () => {
      if (volume.hasBeforeCommand()) {
        await volume.runBeforeCommand();
      }

      if (volume.hasBeforeOnceCommand() && !volume.executedBeforeSyncOnce) {
        await volume.runBeforeOnceCommand();
        volume.executedBeforeOnce = true;
      }

      await this.execLocalSync(rsync, cup);

      if (volume.hasAfterCommand()) {
        await volume.runAfterCommand();
      }

      if (volume.hasAfterOnceCommand() && !volume.executedAfterSyncOnce) {
        await volume.runAfterOnceCommand();
        volume.executedAfterOnce = true;
      }
    };

    watcher.on('ready', handle).on('change', handle);
  }

  handleRemote(volume, rsync, cup) {
    const watcher = new Command(
      `node dist/remonade-chokidar.js --pattern '${volume.remotePattern}'`
    );

    const handleData = debounce(line => {
      switch (line.toString().trim()) {
      case 'ADD':
      case 'CHANGED': {
        this.execRemoteSync(rsync, cup);
        break;
      }
      default: {
        break;
      }
      }
    }, 100);
    watcher.on('data', handleData);
    // watcher.on('end', () => {
    //   console.log('end');
    // });
    volume.remoteMachine.runCommands([watcher]);

    exitHook(cb => {
      this.beforeExit(cb, remoteMachine, watcher);
    });
  }

  async componentDidMount() {
    const {remotes, volumes} = this.props;
    // const remoteMachines = remotes.map(remote => new RemoteMachine(remote));

    remotes
      .map(remote => new RemoteMachine(remote))
      .forEach(remoteMachine => {
        const target = volumes.find(v => v.remoteLabel === remoteMachine.label);
        if (typeof target === 'undefined') {
          throw new Error('err');
        }
        target.remoteMachine = remoteMachine;
      });

    volumes.forEach(volume => {
      const rsync = new Rsync(volume);
      const cup = new Cup(3);
      if (volume.fromLabel === 'local') {
        this.handleLocal(volume, rsync, cup);
      } else {
        this.handleRemote(volume, rsync, cup);
      }
    });

    // console.log(volumes);
    // const remoteMachine = new RemoteMachine(
    //   this.props.ssh,
    //   this.props.base.remote
    // );

    this.props.volumes.forEach(volume => {
      //
      // volume.type =
      //

      const rsync = new Rsync(volume, this.props.ssh);
      const cup = new Cup(3);

      if (volume.main === 'local') {
        this.handleLocal(volume, remoteMachine, rsync, cup);
      } else {
        this.handleRemote(volume, remoteMachine, rsync, cup);
      }
    });
  }
}

Remonade.defaultProps = {
  base: '',
  remotes: [],
  volumes: []
};

Remonade.propTypes = {
  base: PropTypes.string,
  remotes: PropTypes.array,
  volumes: PropTypes.array
};
