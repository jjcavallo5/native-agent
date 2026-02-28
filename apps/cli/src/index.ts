import {Command} from 'commander';
import {getVersion} from './lib/utils';

const program = new Command();

program
	.name('native-agent')
	.description('Give agents the context they need for mobile app development')
	.version(getVersion(), '-v, --version', 'Display version number');
