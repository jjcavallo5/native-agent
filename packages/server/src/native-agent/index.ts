import {
	click,
	view,
	tap,
	swipe,
	text,
	getSize,
	getDriver,
} from '@native-agent/core';

type Driver = Awaited<ReturnType<typeof getDriver>>;

export const getServer = ({driver}: {driver: Driver}) => {
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
