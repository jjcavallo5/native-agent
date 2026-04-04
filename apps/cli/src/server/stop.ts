import * as fs from 'fs';
import {execSync} from 'child_process';
import {NATIVE_AGENT_PORT} from '@/server-entry';

const PID_FILE = '/tmp/native-agent-server.pid';

export const stop = async ({port}: {port?: string}) => {
	const targetPort = port ? parseInt(port) : NATIVE_AGENT_PORT;

	// Try PID file first
	if (fs.existsSync(PID_FILE)) {
		const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
		try {
			process.kill(parseInt(pid));
			console.log(`Stopped server (PID ${pid})`);
		} catch {
			console.log(`Process ${pid} not found, checking port...`);
		}
		fs.unlinkSync(PID_FILE);
		return;
	}

	// Fallback: find process by port
	try {
		const pid = execSync(`lsof -ti:${targetPort}`).toString().trim();
		if (pid) {
			process.kill(parseInt(pid));
			console.log(`Stopped server on port ${targetPort} (PID ${pid})`);
		}
	} catch {
		console.log('No running server found');
	}

	// Clean up PID file if it exists
	if (fs.existsSync(PID_FILE)) {
		fs.unlinkSync(PID_FILE);
	}
};
