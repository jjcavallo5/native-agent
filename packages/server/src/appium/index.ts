import {spawn} from 'child_process';
import {APPIUM_PORT} from '..';

export {getDriver} from './driver';

export const startAppium = ({port = APPIUM_PORT}: {port?: number}) => {
	return spawn('appium', ['-p', `${port}`], {
		stdin: 'inherit',
		stdout: 'pipe',
		stderr: 'inherit',
	});
};

export const waitForAppium = async ({
	port = APPIUM_PORT,
	timeoutMs = 60000,
}: {port?: number; timeoutMs?: number} = {}) => {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(`http://localhost:${port}/status`);
			if (res.ok) return;
		} catch {}
		await new Promise(r => setTimeout(r, 500));
	}
	throw new Error(`Appium did not start within ${timeoutMs}ms`);
};
