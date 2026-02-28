import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from 'bun';

const OpenSchema = z.object({
	appId: z.string(),
});

export const open = async ({
	driver,
	request,
}: {
	driver: Browser;
	request: Request;
}) => {
	try {
		const {appId} = OpenSchema.parse(await request.json());
		console.log(`[POST]: /open   appId="${appId}"`);
		await driver.activateApp(appId);
		await sleep(500);
		return view({driver});
	} catch (e) {
		console.error(`[POST]: /open failed`, e);
		return Response.json({error: 'Open failed'}, {status: 500});
	}
};
