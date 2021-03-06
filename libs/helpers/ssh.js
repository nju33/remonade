/* @flow */

import fs from 'fs';
import {promisify} from 'util';
import ssh from 'ssh2';

export type SshKey = 'hostname' | 'port' | 'forceIPv4' | 'forceIPv6' |
              'hostHash' | 'hostVerifier' | 'user' | 'password' |
              'agent' | 'agentForward' | 'privateKey' | 'passphrase' |
              'localHostname' | 'localUsername' | 'tryKeyBoard' |
              'keepaliveInterval' | 'keepaliveCountMax' | 'readyTimeout' |
              'sock' | 'strictVendor' | 'algorithms' | 'compress' | 'debug' |
              'identifyFile'
export type SshProp = {[SshKey]: any};

const {Client} = ssh;

export default class Ssh {
  config: SshProp;
  conn: Client;

  constructor(config: SshConfig) {
    Object.assign(config, {user: 'remonade'});
    this.config = config;
    Object.assign((this: SshProp), config);
  }

  async init() {
    const readFile = promisify(fs.readFile);
    const privateKey = await readFile(this.config.identifyFile, 'utf-8');
    this.config.privateKey = privateKey;
    (this: SshProp).privateKey = privateKey;
    try {
      await this.connect();
    } catch (err) {
      throw new Error(err);
    }
    return this;
  }

  _runConnection(): void {
    this.conn.connect(this.config);
  }

  connect(): Promise<void | Error> {
    this.conn = new Client();
    return new Promise((resolve, reject) => {
      this.conn
        .on('ready', () => resolve())
        .on('error', err => reject(err));
      this._runConnection();
    });
  }
}
