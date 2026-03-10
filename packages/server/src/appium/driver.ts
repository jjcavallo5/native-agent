import {remote} from 'webdriverio';
import {execSync} from 'child_process';

export const getDriver = async ({
	port,
	device,
	deviceName,
}: {
	port: number;
	device: 'ios' | 'android';
	deviceName?: string;
}) => {
	const webdriverOptions = {
		hostname: 'localhost',
		port,
		logLevel: 'error' as const,
		capabilities: device === 'android'
			? getAndroidDriverCapabilities(deviceName)
			: getIosDriverCapabilities(deviceName),
	};

	try {
		return await remote(webdriverOptions);
	} catch (err) {
		if (device === 'ios' && err instanceof Error && (
			err.message.includes('ECONNREFUSED') ||
			err.message.includes('WebDriverAgent')
		)) {
			console.error(
				'\nFailed to start WebDriverAgent. This is commonly caused by the iOS platform ' +
				'not being installed in Xcode.\n\n' +
				'To fix, run:\n' +
				'  xcodebuild -downloadPlatform iOS\n\n' +
				'Or in Xcode: Settings > Components > download the iOS platform.\n'
			);
		}
		throw err;
	}
};

const getAndroidDriverCapabilities = (deviceName?: string) => {
	return {
		platformName: 'Android',
		'appium:automationName': 'UiAutomator2',
		'appium:deviceName': deviceName ?? 'Android',
		'appium:autoLaunch': false,
		'appium:newCommandTimeout': 0,
	};
};

const getBootedSimulator = (): { udid: string; name: string; platformVersion: string } | undefined => {
	try {
		const output = execSync('xcrun simctl list devices booted -j').toString();
		const data = JSON.parse(output);
		const runtimesOutput = execSync('xcrun simctl list runtimes ios available -j').toString();
		const runtimesData = JSON.parse(runtimesOutput);
		const runtimeVersionMap: Record<string, string> = {};
		for (const rt of runtimesData.runtimes ?? []) {
			runtimeVersionMap[rt.identifier] = rt.version;
		}
		for (const runtime of Object.keys(data.devices)) {
			for (const device of data.devices[runtime]) {
				if (device.state === 'Booted') {
					return {
						udid: device.udid,
						name: device.name,
						platformVersion: runtimeVersionMap[runtime] ?? '',
					};
				}
			}
		}
		return undefined;
	} catch {
		return undefined;
	}
};

const getIosDriverCapabilities = (deviceName?: string) => {
	const booted = getBootedSimulator();
	return {
		platformName: 'iOS',
		'appium:automationName': 'XCUITest',
		'appium:deviceName': booted?.name ?? deviceName ?? 'iPhone Simulator',
		'appium:autoLaunch': false,
		'appium:newCommandTimeout': 0,
		'appium:noReset': true,
		...(booted && {'appium:udid': booted.udid}),
		...(booted?.platformVersion && {'appium:platformVersion': booted.platformVersion}),
	};
};
