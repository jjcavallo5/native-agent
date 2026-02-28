import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const PointSchema = z.object({
	x: z.number().lte(1.0).gte(0.0),
	y: z.number().lte(1.0).gte(0.0),
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
		const {width, height} = await driver.getWindowSize();

		await driver.performActions([
			{
				type: 'pointer',
				id: 'finger1',
				parameters: {pointerType: 'touch'},
				actions: [
					{
						type: 'pointerMove',
						duration: 0,
						x: Math.floor(width * start.x),
						y: Math.floor(height * start.y),
					},
					{type: 'pointerDown', button: 0},
					{type: 'pause', duration: 100},
					{
						type: 'pointerMove',
						duration: 500,
						x: Math.floor(width * end.x),
						y: Math.floor(height * end.y),
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
