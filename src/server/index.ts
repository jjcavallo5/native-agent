import {spawn} from 'child_process';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

export const startServer = async () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	// In dev (tsx), __filename ends in .ts; in prod (compiled), .js
	const ext = __filename.endsWith('.ts') ? 'start.ts' : 'start.js';
	const serverPath = resolve(__dirname, ext);

	const execPath = __filename.endsWith('.ts')
		? process.execPath // node
		: process.execPath;

	const args = __filename.endsWith('.ts')
		? ['--import', 'tsx/esm', serverPath]
		: [serverPath];

	const server = spawn(execPath, args, {
		stdio: 'inherit',
		detached: true,
	});

	server.unref();

	return server;
};
