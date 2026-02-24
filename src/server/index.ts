import {remote} from 'webdriverio';
import express from 'express';
import z from 'zod';
import {execSync, spawn} from 'child_process';

const app = express();
const port = 8647;
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

const ClickSchema = z.object({
	element: z.string(),
});

app.post('/click', async (req, res) => {
	const {element} = ClickSchema.parse(req.body);

	const field = await driver.$(`//*[@text="${element}"]`);
	await field.waitForDisplayed();
	await field.click();

	res.status(200).json({success: true});
});

const TypeSchema = z.object({
	element: z.string(),
	text: z.string(),
});

app.post('/type', async (req, res) => {
	const {element, text} = TypeSchema.parse(req.body);

	const field = await driver.$(`//*[@text="${element}"]`);
	await field.waitForDisplayed();
	await field.setValue(text);

	res.status(200).json({success: true});
});

export const run = async () => {
	app.use(express.json());
	app.listen(port, () => {
		console.info('Server running on port', port);
	});
};
