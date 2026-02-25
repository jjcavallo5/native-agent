import treekill from 'tree-kill';
import {startAppium} from './appium/index.js';
import {startAndroid} from './devices/android.js';
import {startServer} from './server/index.js';

const pids: number[] = [];
let appiumServer: Awaited<ReturnType<typeof startAppium>> | null = null;
let cleaningUp = false;

const cleanup = () => {
	if (cleaningUp) return;
	cleaningUp = true;

	appiumServer?.close();
	for (const pid of pids) {
		treekill(pid, 'SIGTERM');
	}

	process.exit();
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'] as const) {
	process.on(signal, cleanup);
}
process.on('uncaughtException', cleanup);
process.on('unhandledRejection', cleanup);

const run = async () => {
	appiumServer = await startAppium({});
	const emulator = await startAndroid();
	const server = await startServer();

	if (emulator.pid) pids.push(emulator.pid);
	if (server.pid) pids.push(server.pid);
};

run();
