import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from '@/utils';
import type {Request, Response} from 'express';

const OpenSchema = z.object({
	appId: z.string(),
});

export const open = async ({
	driver,
	req,
	res,
}: {
	driver: Browser;
	req: Request;
	res: Response;
}) => {
	try {
		const {appId} = OpenSchema.parse(req.body);
		console.log(`[POST]: /open   appId="${appId}"`);
		await driver.activateApp(appId);
		await sleep(500);
		return view({driver, res});
	} catch (e) {
		console.error(`[POST]: /open failed`, e);
		res.status(500).json({error: 'Open failed'});
	}
};
