import type {Browser} from 'webdriverio';
import z from 'zod';
import {view} from './view';
import {sleep} from 'bun';

const TypeSchema = z.object({
	target: z.string(),
	text: z.string(),
});

export const text = async ({
	driver,
	request,
}: {
	driver: Browser;
	request: Request;
}) => {
	try {
		const {target, text} = TypeSchema.parse(await request.json());
		console.log(`[POST]: /text   target="${target}" text="${text}"`);
		const field = await driver.$(`//*[@text="${target}"]`);
		await field.waitForDisplayed();
		await field.setValue(text);

		await sleep(500);
		return view({driver});
	} catch (e) {
		console.error(`[POST]: /text failed`, e);
		return Response.json({error: 'Text failed'}, {status: 500});
	}
};
