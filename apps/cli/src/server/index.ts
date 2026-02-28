import {getVersion} from '@/lib/utils';
import {Command} from 'commander';
import {start} from './start';
import {NATIVE_AGENT_PORT} from '@native-agent/server';

export const serverCmd = new Command();

serverCmd
	.name('server')
	.description('Handle the Native Agent server')
	.version(getVersion(), '-v, --version', 'Print version');

serverCmd
	.command('start')
	.option('-p, --port <port>', 'Port to run on', NATIVE_AGENT_PORT.toString())
	.option('--headless', 'Run headless mode')
	.option('--device <device id>', 'Device to run on')
	.action(start);
