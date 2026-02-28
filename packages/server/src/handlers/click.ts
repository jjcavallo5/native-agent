import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const ClickSchema = z.object({
	target: z.string(),
});

export const click = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {target} = ClickSchema.parse(req.body);
		console.log(`[POST]: /click   target="${target}"`);
		const field = await driver.$(`//*[@text="${target}"]`);
		await field.waitForDisplayed();
		await field.click();
		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /click failed`, e);
		res.status(500).json({error: 'Click failed'});
	}
};
