import {type Browser} from 'webdriverio';
import type {Response} from 'express';

export const getSize = async ({driver, res}: {driver: Browser; res: Response}) => {
	try {
		console.log(`[GET]: /get-size`);
		const size = await driver.getWindowSize();
		res.json(size);
	} catch (e) {
		console.error(`[GET]: /get-size failed`, e);
		res.status(500).json({error: 'Get size failed'});
	}
};
