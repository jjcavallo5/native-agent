import {
	startServer,
	startAppium,
	APPIUM_PORT,
	NATIVE_AGENT_PORT,
} from '@native-agent/server';

export const start = (port: string, headless: boolean, device: string) => {
	let serverPort = NATIVE_AGENT_PORT;

	try {
		serverPort = port ? parseInt(port) : NATIVE_AGENT_PORT;
	} catch (e) {}

	// startAppium({
	// 	port: APPIUM_PORT,
	// });
	startServer({appiumPort: APPIUM_PORT, serverPort});
};
