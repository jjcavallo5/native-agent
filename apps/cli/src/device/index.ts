import {Command} from 'commander';
import {startAndroid, stopAndroid, startIos, stopIos} from '@native-agent/devices';
import * as fs from 'fs';

const STATE_FILE = '/tmp/native-agent-device.json';

export const deviceCmd = new Command();

deviceCmd
	.name('device')
	.description('Manage devices');

deviceCmd
	.command('start')
	.requiredOption('-p, --platform <platform>', 'Platform to start (e.g. android, ios)')
	.action(async ({platform}: {platform: string}) => {
		if (platform === 'android') {
			await startAndroid();
			fs.writeFileSync(STATE_FILE, JSON.stringify({platform}));
		} else if (platform === 'ios') {
			const {udid} = await startIos();
			fs.writeFileSync(STATE_FILE, JSON.stringify({platform, udid}));
		} else {
			console.error(`Unsupported platform: ${platform}`);
			process.exit(1);
		}
	});

deviceCmd
	.command('stop')
	.action(async () => {
		if (!fs.existsSync(STATE_FILE)) {
			console.error('No device state found. Is a device running?');
			process.exit(1);
		}

		const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

		if (state.platform === 'android') {
			await stopAndroid();
		} else if (state.platform === 'ios') {
			await stopIos({udid: state.udid});
		} else {
			console.error(`Unknown platform in state: ${state.platform}`);
			process.exit(1);
		}

		fs.unlinkSync(STATE_FILE);
		console.log(`Stopped ${state.platform} device`);
	});
