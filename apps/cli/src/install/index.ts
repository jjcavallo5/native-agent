import {Command} from 'commander';
import chalk from 'chalk';
import {Effect, Logger, LogLevel} from 'effect';
import {CustomLogger} from '@/logger';
import {installEasIosEffect} from './eas/ios';

export const installCmd = new Command();

installCmd.name('install').description('Install app builds on devices');

installCmd
	.option('--eas', 'Install from EAS (Expo Application Services)')
	.requiredOption('-p, --platform <platform>', 'Target platform (ios, android)')
	.action(async ({eas, platform}: {eas?: boolean; platform: string}) => {
		if (!eas) {
			console.error(
				chalk.redBright('[ERROR]'),
				'Only --eas installs are currently supported.',
			);
			process.exit(1);
		}

		if (platform === 'android') {
			console.error(
				chalk.redBright('[ERROR]'),
				'Android install is not yet implemented.',
			);
			process.exit(1);
		}

		if (platform !== 'ios') {
			console.error(
				chalk.redBright('[ERROR]'),
				`Unsupported platform: ${platform}`,
			);
			process.exit(1);
		}

		await installEasIosEffect().pipe(
			Logger.withMinimumLogLevel(LogLevel.Debug),
			Effect.catchTags({
				EasBuildListError: e =>
					Effect.logError(`Failed to list EAS builds: ${e.cause}`),
				NoSimulatorBuildError: e => Effect.logError(`${e.cause}`),
				DownloadError: e =>
					Effect.logError(`Failed to download build: ${e.cause}`),
				ExtractError: e =>
					Effect.logError(`Failed to extract build archive: ${e.cause}`),
				InstallError: e => Effect.logError(`Failed to install app: ${e.cause}`),
				ParseError: () =>
					Effect.logError('Failed to parse EAS build list response.'),
			}),
			Effect.provide(CustomLogger),
			Effect.runPromise,
		);
	});
