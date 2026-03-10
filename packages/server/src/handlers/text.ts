import type {Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep, findElement} from '@/utils';
import type {Request, Response} from 'express';

const TypeSchema = z.object({
	target: z.string().optional(),
	text: z.string(),
	focused: z.boolean().optional(),
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
		const {target, text, focused} = TypeSchema.parse(req.body);
		console.log(`[POST]: /text   target="${target}" text="${text}" focused=${focused}`);

		let field;
		if (focused) {
			field = await driver.getActiveElement();
		} else {
			if (!target) {
				res.status(400).json({error: 'Either target or focused must be provided'});
				return;
			}
			field = await findElement(driver, target);
		}

		await field.setValue(text);
		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /text failed`, e);
		res.status(500).json({error: 'Text failed'});
	}
};
