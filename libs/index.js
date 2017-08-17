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


function local(localPath) {
	const Volume = new Volume(this.config)
	return Volume.local(localPath);
}

function remote(remotePath) {
	const Volume = new Volume(this.config)
	return Volume.remote(remotePath);
}

export default class Remonade extends EventEmitter {
	static async adaptConfig (config = {}) {
		const result = await pProps({
			ssh: pProps({
				host: viewSshHostname(config),
				port: (viewSshPort(config) || 22),
				username: viewSshUser(config),
				privateKey: (identifyFile => {
					return promisify(fs.readFile)(identifyFile);
				})(viewSshIdentifyFile(config));
			}),
			base: {
				local: viewBaseLocal(config) || new Volume(),
				remote: viewBaseREmote(config) || new Volume()
			},
			volumes: (volumes => {
				if (volumes.length === 0) {
					throw new Error('Set one or more config.volumes')
				}
				return volumes.map(volume => {
					if (typeof volume === 'function') {
						return volume({local, remote});
					}
					return volume;
				})
			})(config.volumes || [])
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

// process.on('unhandledRejection', console.dir);
