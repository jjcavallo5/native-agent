import {remote} from 'webdriverio';
import express from 'express';
import z from 'zod';
import sharp from 'sharp';

const app = express();
app.use(express.json());
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
		'appium:newCommandTimeout': 0,
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

app.get('/size', async (_req, res) => {
	const size = await driver.getWindowSize();
	res.status(200).json({success: true, ...size});
});

const TapSchema = z.object({
	x: z.number(),
	y: z.number(),
});

app.post('/tap', async (req, res) => {
	const {x, y} = TapSchema.parse(req.body);
	await driver.performActions([
		{
			type: 'pointer',
			id: 'finger1',
			parameters: {pointerType: 'touch'},
			actions: [
				{type: 'pointerMove', duration: 0, x, y},
				{type: 'pointerDown', button: 0},
				{type: 'pause', duration: 100},
				{type: 'pointerUp', button: 0},
			],
		},
	]);
	await driver.releaseActions();
	res.status(200).json({success: true});
});

const ScrollSchema = z.object({
	direction: z.enum(['up', 'down']),
});

app.post('/scroll', async (req, res) => {
	const {direction} = ScrollSchema.parse(req.body);
	const {width, height} = await driver.getWindowSize();
	const centerX = Math.floor(width / 2);
	if (direction === 'down') {
		await driver.performActions([
			{
				type: 'pointer',
				id: 'finger1',
				parameters: {pointerType: 'touch'},
				actions: [
					{
						type: 'pointerMove',
						duration: 0,
						x: centerX,
						y: Math.floor(height * 0.7),
					},
					{type: 'pointerDown', button: 0},
					{type: 'pause', duration: 100},
					{
						type: 'pointerMove',
						duration: 500,
						x: centerX,
						y: Math.floor(height * 0.3),
					},
					{type: 'pointerUp', button: 0},
				],
			},
		]);
	} else {
		await driver.performActions([
			{
				type: 'pointer',
				id: 'finger1',
				parameters: {pointerType: 'touch'},
				actions: [
					{
						type: 'pointerMove',
						duration: 0,
						x: centerX,
						y: Math.floor(height * 0.3),
					},
					{type: 'pointerDown', button: 0},
					{type: 'pause', duration: 100},
					{
						type: 'pointerMove',
						duration: 500,
						x: centerX,
						y: Math.floor(height * 0.7),
					},
					{type: 'pointerUp', button: 0},
				],
			},
		]);
	}
	await driver.releaseActions();
	res.status(200).json({success: true});
});

app.get('/screenshot', async (_req, res) => {
	const rawBase64 = await driver.takeScreenshot();
	const resized = await sharp(Buffer.from(rawBase64, 'base64'))
		.resize({width: 768, withoutEnlargement: true})
		.png()
		.toBuffer();
	const base64 = resized.toString('base64');
	res.status(200).json({success: true, base64});
});

app.listen(port, () => {
	console.info('Server running on port', port);
});
