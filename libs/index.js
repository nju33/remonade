import fs from 'fs';
import {promisify} from 'util';
import EventEmitter from 'events';
import {h, render} from 'ink';
import pProps from 'p-props';
import RemonadeComponent from 'components/remonade';
import Volume from 'helpers/volume';
import {
	viewSshHostname,
	viewSshPort,
	viewSshUser,
	viewSshIdentifyFile,
	viewBaseLocal,
	viewBaseRemote
} from 'helpers/config';


function local(volume, localPath) {
	return volume.local(localPath);
}

function remote(config, remotePath) {
	return volume.remote(remotePath);
}

export default class Remonade extends EventEmitter {
	static async adaptConfig (config = {}) {
		const ssh = await pProps({
			host: viewSshHostname(config),
			port: (viewSshPort(config) || 22),
			username: viewSshUser(config),
			identifyFile: viewSshIdentifyFile(config),
			privateKey: (identifyFile => {
				return promisify(fs.readFile)(identifyFile);
			})(viewSshIdentifyFile(config))
		});

		const result = await pProps({
			ssh,
			volumes: (volumes => {
				if (volumes.length === 0) {
					throw new Error('Set one or more config.volumes')
				}
				return volumes.map(volume => {
					const currentVolume = new Volume(ssh, {
						local: viewBaseLocal(config),
						remote: viewBaseRemote(config)
					});

					if (typeof volume === 'function') {
						return volume(currentVolume);
					}
					return volume;
				})
			})(config.volumes || []),
			commands: config.commands || []
		});
		return result;
	}

	constructor(config = {}) {
		super();
		this.config = config;
	}

	start() {
		render(<RemonadeComponent {...this.config}/>);
	}
};

process.on('unhandledRejection', console.dir);
