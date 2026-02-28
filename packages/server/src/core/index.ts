import {click} from '@/handlers/click';
import {getSize} from '@/handlers/get-size';
import {swipe} from '@/handlers/swipe';
import {tap} from '@/handlers/tap';
import {view} from '@/handlers/view';
import {text} from '@/handlers/text';
import {type Browser} from 'webdriverio';
import {getDriver} from '@/appium';

export const getServer = ({driver}: {driver: Browser}) => {
	return Bun.serve({
		port: 8647,
		hostname: '0.0.0.0',
		routes: {
			'/': () => Response.json({success: true}, {status: 200}),
			'/click': async (request: Request) => {
				const result = await click({driver, request});
				return Response.json(result, {status: 200});
			},
			'/tap': async (request: Request) => {
				const result = await tap({driver, request});
				return Response.json(result, {status: 200});
			},
			'/type': async (request: Request) => {
				const result = await text({driver, request});
				return Response.json(result, {status: 200});
			},
			'/swipe': async (request: Request) => {
				const result = await swipe({driver, request});
				return Response.json(result, {status: 200});
			},
			'/view': async () => {
				const result = await view({driver});
				return Response.json(result, {status: 200});
			},
			'/get-size': async () => {
				const result = await getSize({driver});
				return Response.json(result, {status: 200});
			},
		},
	});
};

export const startServer = async () => {
	const driver = await getDriver({port: 8647, device: 'android'});
	return getServer({driver});
};
