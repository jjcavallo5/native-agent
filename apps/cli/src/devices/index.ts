import {startAndroid, stopAndroid} from './android/index';
import {startIosEffect, stopIos} from './ios/index';
import * as fs from 'fs';
import {Effect, Logger, LogLevel} from 'effect';
import {CustomLogger} from '@/logger';

const STATE_FILE = '/tmp/native-agent-device.json';

type Platform = 'ios' | 'android';

type StartDeviceProps = {
	platform: Platform;
	headless?: boolean;
};

type WriteStateFileProps = {
	platform: Platform;
	udid: string;
};

const writeStateFile = ({platform, udid}: WriteStateFileProps) => {
	fs.writeFileSync(STATE_FILE, JSON.stringify({platform, udid}));
};

const startIosAction = async ({headless}: {headless?: boolean}) => {
	const result = await startIosEffect({headless}).pipe(
		Logger.withMinimumLogLevel(LogLevel.Warning),
		Effect.catchTags({
			ParseError: () =>
				Effect.logError('No iOS devices registered on this device.'),
			DevicesError: () =>
				Effect.logError(
					'`xcrun simctl` failed. Do you have xcode CLI tools installed?',
				),
			RuntimesError: () =>
				Effect.logError(
					'`xcrun simctl` failed. Do you have xcode CLI tools installed?',
				),
		}),
		Effect.provide(CustomLogger),
		Effect.runPromise,
	);
	if (!result) process.exit(1);
	writeStateFile({platform: 'ios', udid: result.udid});
};

export const startDeviceAction = async ({
	platform,
	headless,
}: StartDeviceProps) => {
	if (platform === 'android') {
		await startAndroid({headless});
		fs.writeFileSync(STATE_FILE, JSON.stringify({platform}));
	} else if (platform === 'ios') {
		await startIosAction({headless});
	} else {
		console.error(`Unsupported platform: ${platform}`);
		process.exit(1);
	}
};

export const stopDeviceAction = async () => {
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
};
