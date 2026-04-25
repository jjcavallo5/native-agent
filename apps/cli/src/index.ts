import {Command} from 'commander';
import {getVersion} from './lib/utils';
import {registerActions} from './actions';
import {serverCmd} from './server';
import {deviceCmd} from './device';
import {installCmd} from './install';

const program = new Command();

program
	.name('native-agent')
	.description('Give agents the context they need for mobile app development')
	.version(getVersion(), '-v, --version', 'Display version number');

registerActions(program);

program.addCommand(serverCmd);
program.addCommand(deviceCmd);
program.addCommand(installCmd);

program.parse();
