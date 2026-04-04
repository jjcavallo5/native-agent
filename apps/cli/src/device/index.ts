import {Command} from 'commander';
import {startDeviceAction, stopDeviceAction} from '@/devices';

export const deviceCmd = new Command();

deviceCmd.name('device').description('Manage devices');

deviceCmd
	.command('start')
	.requiredOption(
		'-p, --platform <platform>',
		'Platform to start (e.g. android, ios)',
	)
	.option('--headless', 'Run device without GUI window')
	.action(startDeviceAction);

deviceCmd.command('stop').action(stopDeviceAction);
