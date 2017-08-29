/* @flow */

import fs from 'fs';
import {promisify} from 'util';

export type SshKey = 'host' | 'port' | 'forceIPv4' | 'forceIPv6' |
              'hostHash' | 'hostVerifier' | 'username' | 'password' |
              'agent' | 'agentForward' | 'privateKey' | 'passphrase' |
              'localHostname' | 'localUsername' | 'tryKeyBoard' |
              'keepaliveInterval' | 'keepaliveCountMax' | 'readyTimeout' |
              'sock' | 'strictVendor' | 'algorithms' | 'compress' | 'debug' |
              'identifyFile'
export type SshProp = {[SshKey]: any};

export default class Ssh {
  config: SshConfig;

  constructor(config: SshConfig) {
    Object.assign((this: SshProp), config);
  }

  async init() {
    const readFile = promisify(fs.readFile);
    const privateKey = await readFile((this: SshProp).identifyFile, 'utf-8');
    (this: SshProp).privateKey = privateKey.trim();
    return this;
  }
}
