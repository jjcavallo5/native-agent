import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep, findAllElements} from '@/utils';
import type {Request, Response} from 'express';

const ClickSchema = z.object({
	target: z.string(),
	index: z.number().optional().default(0),
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
		const {target, index} = ClickSchema.parse(req.body);
		console.log(`[POST]: /click   target="${target}" index=${index}`);

		const elements = await findAllElements(driver, target);
		if (index >= elements.length) {
			res.status(400).json({
				error: `Index ${index} out of bounds. Found ${elements.length} element(s) matching "${target}".`,
			});
			return;
		}

		await elements[index].click();
		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /click failed`, e);
		res.status(500).json({error: 'Click failed'});
	}
};
