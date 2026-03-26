import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const KEY_MAP: Record<string, number> = {
	Enter: 66,
	Back: 4,
	Home: 3,
	Tab: 61,
	Delete: 67,
	Up: 19,
	Down: 20,
	Left: 21,
	Right: 22,
	Space: 62,
	Escape: 111,
};

const KeySchema = z.object({
	key: z.string(),
});

export const key = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {key} = KeySchema.parse(req.body);
		console.log(`[POST]: /key   key="${key}"`);

		const keyCode = KEY_MAP[key];
		if (keyCode === undefined) {
			const validKeys = Object.keys(KEY_MAP).join(', ');
			res.status(400).json({error: `Unknown key: "${key}". Valid keys: ${validKeys}`});
			return;
		}

		await driver.pressKeyCode(keyCode);
		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /key failed`, e);
		res.status(500).json({error: 'Key failed'});
	}
};
