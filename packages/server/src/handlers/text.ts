import type {Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const TypeSchema = z.object({
	target: z.string(),
	text: z.string(),
});

export const text = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {target, text} = TypeSchema.parse(req.body);
		console.log(`[POST]: /text   target="${target}" text="${text}"`);
		const field = await driver.$(`//*[@text="${target}"]`);
		await field.waitForDisplayed();
		await field.setValue(text);

		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /text failed`, e);
		res.status(500).json({error: 'Text failed'});
	}
};
