import {remote} from 'webdriverio';

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

const getIosDriverCapabilities = (deviceName?: string) => {
	return {
		platformName: 'iOS',
		'appium:automationName': 'XCUITest',
		'appium:deviceName': deviceName ?? 'iPhone Simulator',
		'appium:autoLaunch': false,
		'appium:newCommandTimeout': 0,
	};
};
