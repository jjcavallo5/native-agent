import type {Browser} from 'webdriverio';
import sharp from 'sharp';
import {writeFile, mkdir} from 'fs/promises';
import {join, dirname, resolve} from 'path';
import type {Request, Response} from 'express';

export const view = async ({driver, req, res}: {driver: Browser; req?: Request; res: Response}) => {
	try {
		console.log(`[GET]: /view`);
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

		let outputPath: string | undefined;
		const output = req?.query?.output as string | undefined;
		if (output) {
			const absPath = resolve(output);
			await mkdir(dirname(absPath), {recursive: true});
			await writeFile(absPath, buffer);
			outputPath = absPath;
		}

		res.json({
			success: true,
			path: filepath,
			width,
			height,
			format,
			sizeBytes: size,
			...(outputPath && {outputPath}),
		});
	} catch (e) {
		console.error(`[GET]: /view failed`, e);
		res.status(500).json({error: 'View failed'});
	}
};
