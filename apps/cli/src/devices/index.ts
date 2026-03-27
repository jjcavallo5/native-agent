import {startAndroid, stopAndroid} from './android/index';
import {startIos, startIosEffect, stopIos} from './ios/index';
import * as fs from 'fs';
import {Effect, Logger, LogLevel} from 'effect';

const STATE_FILE = '/tmp/native-agent-device.json';

type StartDeviceProps = {
	platform: string;
	headless?: boolean;
};

export const startDeviceAction = async ({
	platform,
	headless,
}: StartDeviceProps) => {
	if (platform === 'android') {
		await startAndroid({headless});
		fs.writeFileSync(STATE_FILE, JSON.stringify({platform}));
	} else if (platform === 'ios') {
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
			Effect.runPromise,
		);
		if (!result) process.exit(1);
		fs.writeFileSync(STATE_FILE, JSON.stringify({platform, udid: result.udid}));
	} else {
		console.error(`Unsupported platform: ${platform}`);
		process.exit(1);
	}
};
