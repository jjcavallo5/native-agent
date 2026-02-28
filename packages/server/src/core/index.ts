import express from 'express';
import {click} from '@/handlers/click';
import {getSize} from '@/handlers/get-size';
import {open} from '@/handlers/open';
import {swipe} from '@/handlers/swipe';
import {tap} from '@/handlers/tap';
import {view} from '@/handlers/view';
import {text} from '@/handlers/text';
import {type Browser} from 'webdriverio';
import {getDriver} from '@/appium';
import {NATIVE_AGENT_PORT, APPIUM_PORT} from '..';

export const getServer = ({driver, port}: {driver: Browser; port: number}) => {
	const app = express();
	app.use(express.json());

	app.all('/', (_req, res) => {
		res.json({success: true});
	});

	app.post('/click', async (req, res) => {
		await click({driver, req, res});
	});

	app.post('/tap', async (req, res) => {
		await tap({driver, req, res});
	});

	app.post('/text', async (req, res) => {
		await text({driver, req, res});
	});

	app.post('/swipe', async (req, res) => {
		await swipe({driver, req, res});
	});

	app.post('/open', async (req, res) => {
		await open({driver, req, res});
	});

	app.get('/view', async (_req, res) => {
		await view({driver, res});
	});

	app.get('/get-size', async (_req, res) => {
		await getSize({driver, res});
	});

	app.use((req, res) => {
		console.log(`[${req.method}]: ${req.path}   404`);
		res.status(404).json({error: 'Not found'});
	});

	return new Promise<ReturnType<typeof app.listen>>((resolve) => {
		const server = app.listen(port, 'localhost', () => {
			resolve(server);
		});
	});
};

export const startServer = async ({
	appiumPort = APPIUM_PORT,
	serverPort = NATIVE_AGENT_PORT,
}: {
	appiumPort?: number;
	serverPort?: number;
}) => {
	console.log('Starting server...');
	const driver = await getDriver({port: appiumPort, device: 'android'});
	return getServer({driver, port: serverPort});
};
