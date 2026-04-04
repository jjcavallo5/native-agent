import {startAndroidEffect, stopAndroid} from './android/index';
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

const startAndroidAction = async ({headless}: {headless?: boolean}) => {
	const result = await startAndroidEffect({headless}).pipe(
		Logger.withMinimumLogLevel(LogLevel.Debug),
		Effect.catchTags({
			NoAndroidHome: () =>
				Effect.logError(
					'ANDROID_HOME environment variable is not set.',
				),
			NoDeviceFound: () =>
				Effect.logError(
					'No AVD devices found and setup was declined or failed.',
				),
			EmulatorAlreadyRunning: () =>
				Effect.logError('An emulator is already running.'),
			SetupError: e =>
				Effect.logError(`Android setup failed: ${e.cause}`),
		}),
		Effect.provide(CustomLogger),
		Effect.runPromise,
	);
	if (!result) process.exit(1);
	writeStateFile({platform: 'android', udid: result});
};

const startIosAction = async ({headless}: {headless?: boolean}) => {
	const result = await startIosEffect({headless}).pipe(
		Logger.withMinimumLogLevel(LogLevel.Debug),
		Effect.catchTags({
			ParseError: () =>
				Effect.logError('No iOS devices registered on this device.'),
			DevicesError: () =>
				Effect.logError(
					'No iOS simulators found and setup was declined or failed.',
				),
			RuntimesError: () =>
				Effect.logError(
					'No iOS runtimes found and setup was declined or failed.',
				),
			SetupError: e =>
				Effect.logError(`iOS setup failed: ${e.cause}`),
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
		await startAndroidAction({headless});
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
