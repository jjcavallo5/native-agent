import {Logger} from 'effect';
import chalk from 'chalk';
import {LogLevel} from 'effect';

// Custom logger that outputs log messages to the console
const logger = Logger.make(({logLevel, message}) => {
	const logTag = `[${logLevel.label}]: `;
	const fmt = (v: unknown) => {
		if (typeof v === 'object' && v !== null) {
			try {
				return JSON.stringify(v, null, 2);
			} catch {
				return String(v);
			}
		}
		return String(v);
	};
	const msg = message instanceof Array ? message.map(fmt).join(' ') : fmt(message);
	switch (logLevel.label) {
		case 'DEBUG':
			globalThis.console.log(chalk.blue(logTag), msg);
			break;
		case 'INFO':
			globalThis.console.log(chalk.greenBright(logTag), msg);
			break;
		case 'WARN':
			globalThis.console.warn(chalk.yellowBright(logTag), msg);
			break;
		case 'TRACE':
			globalThis.console.log(chalk.yellowBright(logTag), msg);
			break;
		case 'ERROR':
			globalThis.console.error(chalk.redBright(logTag), msg);
			break;
		case 'FATAL':
			globalThis.console.error(chalk.bgRedBright(logTag), msg);
			break;
		case 'ALL':
			globalThis.console.log(logTag, msg);
			break;
	}
});

export const CustomLogger = Logger.replace(Logger.defaultLogger, logger);
