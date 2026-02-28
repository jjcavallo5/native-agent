import {type Browser} from 'webdriverio';
import {view} from './view';
import z from 'zod';
import {sleep} from 'bun';

const ClickSchema = z.object({
	target: z.string(),
});

export const click = async ({
	driver,
	request,
}: {
	driver: Browser;
	request: Request;
}) => {
	const {target} = ClickSchema.parse(await request.json());
	const field = await driver.$(`//*[@text="${target}"]`);
	await field.waitForDisplayed();
	await field.click();
	await sleep(500);
	return view({driver});
};
