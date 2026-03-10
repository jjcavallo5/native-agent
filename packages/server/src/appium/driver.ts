import {remote} from 'webdriverio';
import {execSync} from 'child_process';

export const getDriver = ({
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
	return remote(webdriverOptions);
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

const getIosPlatformVersion = (): string | undefined => {
	try {
		const output = execSync('xcrun simctl list runtimes ios available -j').toString();
		const data = JSON.parse(output);
		const runtimes: {version: string}[] = data.runtimes ?? [];
		if (runtimes.length === 0) return undefined;
		return runtimes[runtimes.length - 1].version;
	} catch {
		return undefined;
	}
};

const getIosDriverCapabilities = (deviceName?: string) => {
	const platformVersion = getIosPlatformVersion();
	return {
		platformName: 'iOS',
		'appium:automationName': 'XCUITest',
		'appium:deviceName': deviceName ?? 'iPhone Simulator',
		'appium:autoLaunch': false,
		'appium:newCommandTimeout': 0,
		...(platformVersion && {'appium:platformVersion': platformVersion}),
	};
};
