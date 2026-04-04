import {execSync, spawn} from 'child_process';
import {arch} from 'os';
import {Effect, Data} from 'effect';
import {confirmPrompt} from '../prompt';

class NoAndroidHome extends Data.TaggedError('NoAndroidHome') {}

class NoDeviceFound extends Data.TaggedError('NoDeviceFound') {}

class EmulatorAlreadyRunning extends Data.TaggedError(
	'EmulatorAlreadyRunning',
) {}

class SetupError extends Data.TaggedError('SetupError')<{cause: unknown}> {}

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

const getSystemImageArch = () =>
	arch() === 'arm64' ? 'arm64-v8a' : 'x86_64';

const findLatestSystemImage = (androidHome: string) =>
	Effect.gen(function* () {
		const output = yield* Effect.try({
			try: () =>
				execSync(
					`${androidHome}/cmdline-tools/latest/bin/sdkmanager --list`,
				).toString(),
			catch: cause => new SetupError({cause}),
		});

		const imageArch = getSystemImageArch();
		const imagePattern =
			/system-images;android-(\d+);google_apis;(arm64-v8a|x86_64)/;
		const matches = output
			.split('\n')
			.map(line => line.trim())
			.filter(line => imagePattern.test(line) && line.includes(imageArch))
			.map(line => {
				const match = line.match(imagePattern);
				return match
					? {id: match[0], apiLevel: parseInt(match[1]!, 10)}
					: null;
			})
			.filter(m => !!m);

		const latest = matches.sort((a, b) => a.apiLevel - b.apiLevel).at(-1);
		if (!latest) {
			return yield* new SetupError({
				cause: `No system images found for architecture ${imageArch}`,
			});
		}
		return latest.id;
	});

const downloadSystemImage = (androidHome: string, imageId: string) =>
	Effect.gen(function* () {
		const confirmed = yield* confirmPrompt(
			`No AVDs found. Download system image "${imageId}"?`,
		);
		if (!confirmed) {
			return yield* new NoDeviceFound();
		}

		yield* Effect.try({
			try: () =>
				execSync(
					`${androidHome}/cmdline-tools/latest/bin/sdkmanager "${imageId}"`,
					{stdio: 'inherit'},
				),
			catch: cause => new SetupError({cause}),
		});
	});

const createAvd = (androidHome: string, imageId: string) =>
	Effect.gen(function* () {
		const apiMatch = imageId.match(/android-(\d+)/);
		const name = `auto_android_${apiMatch?.[1] ?? 'device'}`;

		yield* Effect.try({
			try: () =>
				execSync(
					`${androidHome}/cmdline-tools/latest/bin/avdmanager create avd -n ${name} -k "${imageId}" --device "pixel"`,
					{stdio: 'inherit'},
				),
			catch: cause => new SetupError({cause}),
		});

		return name;
	});

export const startAndroidEffect = ({headless}: {headless?: boolean} = {}) =>
	Effect.gen(function* () {
		// 1. Validate android home
		const androidHome = yield* validateAndroidHome();

		// 2. Get device (or set up if none found)
		const device = yield* getDevice(androidHome).pipe(
			Effect.catchTag('NoDeviceFound', () =>
				Effect.gen(function* () {
					const imageId = yield* findLatestSystemImage(androidHome);
					yield* downloadSystemImage(androidHome, imageId);
					yield* createAvd(androidHome, imageId);
					return yield* getDevice(androidHome);
				}),
			),
		);

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
