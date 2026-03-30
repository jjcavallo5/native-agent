import {Logger} from 'effect';

// Custom logger that outputs log messages to the console
const logger = Logger.make(({logLevel, message}) => {
	globalThis.console.log(`[${logLevel.label}] ${message}`, {color: '#F44336'});
});

export const CustomLogger = Logger.replace(Logger.defaultLogger, logger);
