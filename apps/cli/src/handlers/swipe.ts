import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const SCREENSHOT_WIDTH = 768;

const PointSchema = z.object({
	x: z.number(),
	y: z.number(),
});

const SwipeSchema = z.object({
	start: PointSchema,
	end: PointSchema,
});

export const swipe = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {start, end} = SwipeSchema.parse(req.body);
		console.log(`[POST]: /swipe   start=(${start.x},${start.y}) end=(${end.x},${end.y})`);
		const {width: deviceWidth} = await driver.getWindowSize();
		const scale = deviceWidth / SCREENSHOT_WIDTH;

		await driver.performActions([
			{
				type: 'pointer',
				id: 'finger1',
				parameters: {pointerType: 'touch'},
				actions: [
					{
						type: 'pointerMove',
						duration: 0,
						x: Math.round(start.x * scale),
						y: Math.round(start.y * scale),
					},
					{type: 'pointerDown', button: 0},
					{type: 'pause', duration: 100},
					{
						type: 'pointerMove',
						duration: 500,
						x: Math.round(end.x * scale),
						y: Math.round(end.y * scale),
					},
					{type: 'pointerUp', button: 0},
				],
			},
		]);
		await driver.releaseActions();

		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /swipe failed`, e);
		res.status(500).json({error: 'Swipe failed'});
	}
};
