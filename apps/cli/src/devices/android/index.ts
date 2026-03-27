import {execSync, spawn} from 'child_process';
import {Effect} from 'effect';

export const startAndroid = async ({headless}: {headless?: boolean} = {}) => {
	const androidHome = process.env.ANDROID_HOME;
	if (!androidHome) {
		throw new Error('ANDROID_HOME environment variable is not set');
	}

	// Get the latest AVD device name
	const avdOutput = execSync(
		`${androidHome}/cmdline-tools/latest/bin/avdmanager list avd`,
	).toString();

	const nameLines = avdOutput.split('\n').filter(line => line.includes('Name'));
	const lastNameLine = nameLines[nameLines.length - 1];
	if (!lastNameLine) {
		throw new Error('No AVD devices found');
	}

	const device = lastNameLine.replace(/Name:\s*/, '').trim();

	// Check if an emulator is already running
	try {
		const devices = execSync('adb devices').toString();
		const emulatorRunning = devices
			.split('\n')
			.some(line => line.includes('emulator') && line.includes('device'));
		if (emulatorRunning) {
			return null;
		}
	} catch {}

	// Launch the emulator with the device
	const args = ['-avd', device];
	if (headless) {
		args.push('-no-window');
	}

	const emulator = spawn(`${androidHome}/emulator/emulator`, args, {
		stdio: headless ? 'ignore' : 'inherit',
	});

	return emulator;
};

export const stopAndroid = async () => {
	execSync('adb emu kill', {stdio: 'inherit'});
};
