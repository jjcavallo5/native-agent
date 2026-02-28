import {Command} from 'commander';
import {startAndroid} from '@native-agent/devices';

export const deviceCmd = new Command();

deviceCmd
	.name('device')
	.description('Manage devices');

deviceCmd
	.command('start')
	.requiredOption('-p, --platform <platform>', 'Platform to start (e.g. android)')
	.action(async ({platform}: {platform: string}) => {
		if (platform !== 'android') {
			console.error(`Unsupported platform: ${platform}`);
			process.exit(1);
		}

		await startAndroid();
	});
