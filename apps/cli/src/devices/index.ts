import {startAndroidEffect, stopAndroid} from './android/index';
import {startIosEffect, stopIos} from './ios/index';
import * as fs from 'fs';
import {Effect, Logger, LogLevel} from 'effect';
import {CustomLogger} from '@/logger';

const STATE_FILE = '/tmp/native-agent-devices.json';

type Platform = 'ios' | 'android';

type DeviceEntry = {
	platform: Platform;
	udid: string;
};

type StartDeviceProps = {
	platform: Platform;
	headless?: boolean;
};

const readStateFile = (): DeviceEntry[] => {
	try {
		return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
	} catch {
		return [];
	}
};

const addDeviceToState = ({platform, udid}: DeviceEntry) => {
	const devices = readStateFile().filter(d => d.udid !== udid);
	devices.push({platform, udid});
	fs.writeFileSync(STATE_FILE, JSON.stringify(devices));
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
	addDeviceToState({platform: 'android', udid: result});
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
	addDeviceToState({platform: 'ios', udid: result.udid});
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
	const devices = readStateFile();
	if (devices.length === 0) {
		console.error('No device state found. Is a device running?');
		process.exit(1);
	}

	for (const device of devices) {
		if (device.platform === 'android') {
			await stopAndroid({udid: device.udid});
		} else if (device.platform === 'ios') {
			await stopIos({udid: device.udid});
		} else {
			console.error(`Unknown platform in state: ${device.platform}`);
			continue;
		}
		console.log(`Stopped ${device.platform} device (${device.udid})`);
	}

	fs.unlinkSync(STATE_FILE);
};
