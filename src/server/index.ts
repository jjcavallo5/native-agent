import {remote} from 'webdriverio';

const run = async () => {
	const driver = await remote({
		hostname: 'localhost',
		port: 4723,
		logLevel: 'info',
		capabilities: {
			platformName: 'Android',
			'appium:automationName': 'UiAutomator2',
			'appium:deviceName': 'Android',
			'appium:appPackage': 'com.contractory',
		},
	});
};
