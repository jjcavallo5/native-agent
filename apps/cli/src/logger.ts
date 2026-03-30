import {Logger} from 'effect';
import chalk from 'chalk';

// Custom logger that outputs log messages to the console
const logger = Logger.make(({logLevel, message}) => {
	const logTag = `[${logLevel.label}]: `;
	switch (logLevel.label) {
		case 'DEBUG':
			globalThis.console.log(chalk.blue(logTag), message);
			break;
		case 'INFO':
			globalThis.console.log(chalk.greenBright(logTag), message);
			break;
		case 'WARN':
			globalThis.console.log(chalk.yellowBright(logTag), message);
			break;
		case 'TRACE':
			globalThis.console.log(chalk.yellowBright(logTag), message);
			break;
		case 'ERROR':
			globalThis.console.log(chalk.redBright(logTag), message);
			break;
		case 'FATAL':
			globalThis.console.log(chalk.bgRedBright(logTag), message);
			break;
		case 'ALL':
			globalThis.console.log(logTag, message);
			break;
	}
});

export const CustomLogger = Logger.replace(Logger.defaultLogger, logger);
