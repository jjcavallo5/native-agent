import {remote} from 'webdriverio';

export const getDriver = ({
	port,
	device,
}: {
	port: number;
	device: 'ios' | 'android';
}) => {
	const webdriverOptions = {
		hostname: 'localhost',
		port,
		logLevel: 'error' as const,
		capabilities: device === 'android' ? getAndroidDriverCapabilities() : {},
	};
	return remote(webdriverOptions);
};

const getAndroidDriverCapabilities = () => {
	return {
		platformName: 'Android',
		'appium:automationName': 'UiAutomator2',
		'appium:deviceName': 'Android',
		'appium:autoLaunch': false,
		'appium:newCommandTimeout': 0,
	};
};
