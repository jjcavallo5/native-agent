import {execSync, spawn} from 'child_process';
import {Effect, Data} from 'effect';

class NoAndroidHome extends Data.TaggedError('NoAndroidHome') {}

class NoDeviceFound extends Data.TaggedError('NoDeviceFound') {}

class EmulatorAlreadyRunning extends Data.TaggedError(
	'EmulatorAlreadyRunning',
) {}

const validateAndroidHome = () =>
	Effect.gen(function* () {
		const androidHome = process.env.ANDROID_HOME;
		if (!androidHome) {
			return yield* new NoAndroidHome();
		}
		return androidHome;
	});

const getDevice = (androidHome: string) =>
	Effect.gen(function* () {
		const avdOutput = yield* Effect.try({
			try: () =>
				execSync(
					`${androidHome}/cmdline-tools/latest/bin/avdmanager list avd`,
				).toString(),
			catch: cause => new NoDeviceFound(),
		});

		const nameLines = avdOutput
			.split('\n')
			.filter(line => line.includes('Name'));

		const lastNameLine = nameLines[nameLines.length - 1];
		if (!lastNameLine) {
			return yield* new NoDeviceFound();
		}

		return lastNameLine.replace(/Name:\s*/, '').trim();
	});

const checkEmulatorRunning = () =>
	Effect.gen(function* () {
		const devices = yield* Effect.try({
			try: () => execSync('adb devices').toString(),
			catch: () => '',
		});
		const emulatorRunning = devices
			.split('\n')
			.some(line => line.includes('emulator') && line.includes('device'));
		if (emulatorRunning) {
			return yield* new EmulatorAlreadyRunning();
		}
	});

export const startAndroidEffect = ({headless}: {headless?: boolean} = {}) =>
	Effect.gen(function* () {
		// 1. Validate android home
		const androidHome = yield* validateAndroidHome();

		// 2. Get device
		const device = yield* getDevice(androidHome);

		// 3. Check if an emulator is already running
		yield* checkEmulatorRunning();

		// 4. Launch the emulator
		const args = ['-avd', device];
		if (headless) {
			args.push('-no-window');
		}

		spawn(`${androidHome}/emulator/emulator`, args, {
			stdio: headless ? 'ignore' : 'inherit',
		});

		return device;
	});

export const stopAndroid = async () => {
	execSync('adb emu kill', {stdio: 'inherit'});
};
