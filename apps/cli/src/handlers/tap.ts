import {type Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const SCREENSHOT_WIDTH = 768;

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

		const {width: deviceWidth, height: deviceHeight} =
			await driver.getWindowSize();
		const scale = deviceWidth / SCREENSHOT_WIDTH;
		const deviceX = Math.round(x * scale);
		const deviceY = Math.round(y * scale);

		console.log(
			`[POST]: /tap   screenshot=(${x}, ${y})  device=(${deviceX}, ${deviceY})`,
		);

		await driver.performActions([
			{
				type: 'pointer',
				id: 'finger1',
				parameters: {pointerType: 'touch'},
				actions: [
					{type: 'pointerMove', duration: 0, x: deviceX, y: deviceY},
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
