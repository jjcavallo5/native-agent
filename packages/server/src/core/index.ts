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
			'/': () => Response.json({success: true}, {status: 200}),
			'/click': (request: Request) => click({driver, request}),
			'/tap': (request: Request) => tap({driver, request}),
			'/text': (request: Request) => text({driver, request}),
			'/swipe': (request: Request) => swipe({driver, request}),
			'/view': () => view({driver}),
			'/get-size': () => getSize({driver}),
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
	const driver = await getDriver({port: appiumPort, device: 'android'});
	return getServer({driver, port: serverPort});
};
