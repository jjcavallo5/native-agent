import {spawn} from 'child_process';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

export const startServer = async () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const serverPath = resolve(__dirname, 'start.js');

	const server = spawn('node', [serverPath], {
		stdio: 'inherit',
		detached: true,
	});

	server.unref();

	return server;
};
