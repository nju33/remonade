import R from 'ramda';

const sshHostnameLens = R.lensPath(['ssh', 'hostname']);
export const viewSshHostname = conf => R.view(sshHostnameLens, conf);

const sshPortLens = R.lensPath(['ssh', 'port']);
export const viewSshPort = conf => R.view(sshPortLens, conf);

const sshUserLens = R.lensPath(['ssh', 'user']);
export const viewSshUser = conf => R.view(sshUserLens, conf);

const sshIdentifyFileLens = R.lensPath(['ssh', 'identifyFile']);
export const viewSshIdentifyFile = conf => R.view(sshIdentifyFileLens, conf);

const baseLocalLens = R.lensPath(['base', 'local']);
export const viewBaseLocal = conf => R.view(baseLocalLens, conf);

const baseRemoteLens  R.lensPath(['base', 'remote']);
export const viewBaseRemote = conf => R.view(baseRemoteLens, conf);
