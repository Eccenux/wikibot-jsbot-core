/**
 * Dev/staging deploy.
 */
import {DeployConfig, WikiployLite} from 'wikiploy';

import * as botpass from './bot.config.mjs';
const ployBot = new WikiployLite(botpass);

// custom summary
ployBot.summary = () => {
	return 'v2.2.2: bioSort chin';
}

(async () => {
	const configs = [];
	configs.push(new DeployConfig({
		src: 'jsbot.js',
	}));
	await ployBot.deploy(configs);
})().catch(err => {
	console.error(err);
	process.exit(1);
});