import {click} from '@/handlers/click';
import {getSize} from '@/handlers/get-size';
import {swipe} from '@/handlers/swipe';
import {tap} from '@/handlers/tap';
import {view} from '@/handlers/view';
import {text} from '@/handlers/text';
import {type Browser} from 'webdriverio';
import {getDriver} from '@/appium';
import {NATIVE_AGENT_PORT, APPIUM_PORT} from '..';

export const getServer = ({driver, port}: {driver: Browser; port: number}) => {
	return Bun.serve({
		port,
		hostname: 'localhost',
		routes: {
			'/': async () => Response.json({success: true}, {status: 200}),
			'/click': async (request: Request) => await click({driver, request}),
			'/tap': async (request: Request) => await tap({driver, request}),
			'/text': async (request: Request) => await text({driver, request}),
			'/swipe': async (request: Request) => await swipe({driver, request}),
			'/view': async () => await view({driver}),
			'/get-size': async () => await getSize({driver}),
		},
		fetch(request) {
			console.log(
				`[${request.method}]: ${new URL(request.url).pathname}   404`,
			);
			return Response.json({error: 'Not found'}, {status: 404});
		},
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
