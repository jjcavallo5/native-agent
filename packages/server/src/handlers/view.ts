import type {Browser} from 'webdriverio';
import sharp from 'sharp';
import {writeFile, mkdir} from 'fs/promises';
import {join} from 'path';

export const view = async ({driver}: {driver: Browser}) => {
	const rawBase64 = await driver.takeScreenshot();
	const resized = sharp(Buffer.from(rawBase64, 'base64'))
		.resize({
			width: 768,
			withoutEnlargement: true,
		})
		.png();

	const {width, height, format, size} = await resized
		.toBuffer({resolveWithObject: true})
		.then(({data, info}) => ({
			width: info.width,
			height: info.height,
			format: info.format,
			size: data.length,
		}));

	const buffer = await resized.toBuffer();
	const dir = '/tmp/native-agent-screenshots';
	await mkdir(dir, {recursive: true});
	const filename = `screenshot-${Date.now()}.png`;
	const filepath = join(dir, filename);
	await writeFile(filepath, buffer);

	return Response.json({
		success: true,
		path: filepath,
		width,
		height,
		format,
		sizeBytes: size,
	});
};
