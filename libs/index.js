import fs from 'fs';
import {promisify} from 'util';
import EventEmitter from 'events';
import {h, render} from 'ink';
import pProps from 'p-props';
import RemonadeComponent from 'components/remonade';

export default class Remonade extends EventEmitter {
	static async adaptConfig (config = {}) {
		const result = await pProps({
			ssh: pProps({
				host: config.ssh.hostname,
				port: (config.ssh.port || 22),
				username: config.ssh.user,
				privateKey: promisify(fs.readFile)(config.ssh.identifyFile)
			}),
			commands: (config.commands || []),
			volumes: (config.volumes || [])
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
