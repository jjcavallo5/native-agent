import {
	startServer,
	startAppium,
	waitForAppium,
	APPIUM_PORT,
	NATIVE_AGENT_PORT,
} from '@native-agent/server';

export const start = async ({
	port,
	headless,
	device,
}: {port?: string; headless?: boolean; device?: string}) => {
	let serverPort = NATIVE_AGENT_PORT;

	try {
		serverPort = port ? parseInt(port) : NATIVE_AGENT_PORT;
	} catch (e) {}

	startAppium({
		port: APPIUM_PORT,
	});
	await waitForAppium({port: APPIUM_PORT});
	const server = await startServer({appiumPort: APPIUM_PORT, serverPort});
	console.log(`Native Agent server listening on http://localhost:${server.port}`);
};
