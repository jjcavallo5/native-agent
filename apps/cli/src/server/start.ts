import {
	startServer,
	startAppium,
	waitForAppium,
	APPIUM_PORT,
	NATIVE_AGENT_PORT,
} from '@/server-entry';
import {startAndroid, startIos} from '@/devices';
import * as fs from 'fs';

const PID_FILE = '/tmp/native-agent-server.pid';

export const start = async ({
	port,
	headless,
	device,
	platform = 'android',
}: {port?: string; headless?: boolean; device?: string; platform?: string}) => {
	let serverPort = NATIVE_AGENT_PORT;

	try {
		serverPort = port ? parseInt(port) : NATIVE_AGENT_PORT;
	} catch (e) {}

	if (headless) {
		if (platform === 'ios') {
			await startIos({headless: true});
		} else {
			await startAndroid({headless: true});
		}
	}

	startAppium({
		port: APPIUM_PORT,
	});
	await waitForAppium({port: APPIUM_PORT});
	const server = await startServer({
		appiumPort: APPIUM_PORT,
		serverPort,
		device: platform as 'ios' | 'android',
		deviceName: device,
	});

	fs.writeFileSync(PID_FILE, process.pid.toString());

	const addr = server.address();
	const listeningPort = typeof addr === 'object' && addr ? addr.port : serverPort;
	console.log(`Native Agent server listening on http://localhost:${listeningPort}`);
};
