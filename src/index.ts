import {remote} from 'webdriverio';
import {spawn} from 'child_process';

const clickButton = async (driver: any, btnTxt: string) => {
	const btn = await driver.$(`//*[@text="${btnTxt}"]`);
	await btn.waitForDisplayed();
	await btn.click();
};

const enterText = async (
	driver: WebdriverIO.Browser,
	selectorTxt: string,
	toEnter: string,
) => {
	const field = await driver.$(`//*[@text="${selectorTxt}"]`);
	await field.waitForDisplayed();
	await field.setValue(toEnter);
};

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
	try {
		await clickButton(driver, 'Sign In');
		await enterText(driver, 'Email', process.env.LOGIN_EMAIL!);
		await enterText(driver, 'Password', process.env.LOGIN_PASS!);
		await clickButton(driver, 'Sign In');
	} finally {
		await driver.pause(100000);
		await driver.deleteSession();
	}
};

run().catch(console.error);
