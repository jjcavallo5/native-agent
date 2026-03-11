import {getVersion} from '../lib/utils';
import {Command} from 'commander';
import {start} from './start';
import {stop} from './stop';
import {NATIVE_AGENT_PORT} from '@native-agent/server';

export const serverCmd = new Command();

serverCmd
	.name('server')
	.description('Handle the Native Agent server')
	.version(getVersion(), '-v, --version', 'Print version');

serverCmd
	.command('start')
	.option('--port <port>', 'Port to run on', NATIVE_AGENT_PORT.toString())
	.option('--headless', 'Run headless mode')
	.option('--device <device id>', 'Device to run on')
	.option('-p, --platform <platform>', 'Platform to use', 'android')
	.action(start);

serverCmd
	.command('stop')
	.option('--port <port>', 'Port of server to stop', NATIVE_AGENT_PORT.toString())
	.action(stop);
