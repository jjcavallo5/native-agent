import {type Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep} from 'bun';

const TapSchema = z.object({
	x: z.number(),
	y: z.number(),
});

export const tap = async ({
	driver,
	request,
}: {
	driver: Browser;
	request: Request;
}) => {
	const {x, y} = TapSchema.parse(await request.json());
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

	await sleep(500);
	return view({driver});
};
