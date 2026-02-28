import {type Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const TapSchema = z.object({
	x: z.number(),
	y: z.number(),
});

export const tap = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {x, y} = TapSchema.parse(req.body);
		console.log(`[POST]: /tap   x=${x}, y=${y}`);
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
		return view({driver, res});
	} catch (e) {
		console.error(JSON.stringify(e, null, 2));
		res.status(500).json({error: 'Tap failed'});
	}
};
