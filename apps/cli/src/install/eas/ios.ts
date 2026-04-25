import {execFileSync, execSync} from 'child_process';
import {Effect, Schema, Data} from 'effect';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

class EasBuildListError extends Data.TaggedError('EasBuildListError')<{
	cause: unknown;
}> {}
class NoSimulatorBuildError extends Data.TaggedError(
	'NoSimulatorBuildError',
)<{cause: unknown}> {}
class DownloadError extends Data.TaggedError('DownloadError')<{
	cause: unknown;
}> {}
class ExtractError extends Data.TaggedError('ExtractError')<{
	cause: unknown;
}> {}
class InstallError extends Data.TaggedError('InstallError')<{
	cause: unknown;
}> {}

const EasBuildSchema = Schema.Struct({
	id: Schema.String,
	platform: Schema.String,
	status: Schema.String,
	buildProfile: Schema.String,
	isForIosSimulator: Schema.Boolean,
	artifacts: Schema.Struct({
		buildUrl: Schema.String,
	}),
	appVersion: Schema.optional(Schema.String),
	createdAt: Schema.String,
});

const EasBuildListSchema = Schema.Array(EasBuildSchema);

const getEasBuilds = () =>
	Effect.gen(function* () {
		const output = yield* Effect.try({
			try: () =>
				execSync(
					'eas build:list --platform ios --status finished --json --non-interactive',
				).toString(),
			catch: cause => {
				const msg =
					cause instanceof Error &&
					'code' in cause &&
					(cause as NodeJS.ErrnoException).code === 'ENOENT'
						? 'EAS CLI not found. Install it with `npm install -g eas-cli`.'
						: cause;
				return new EasBuildListError({cause: msg});
			},
		});

		const parsed = yield* Effect.try({
			try: () => JSON.parse(output),
			catch: cause => new EasBuildListError({cause}),
		});

		return yield* Schema.decodeUnknown(EasBuildListSchema)(parsed);
	});

const findSimulatorBuild = (
	builds: typeof EasBuildListSchema.Type,
) =>
	Effect.gen(function* () {
		const simulatorBuilds = builds.filter(b => b.isForIosSimulator);
		const latest = simulatorBuilds.at(0);
		if (!latest) {
			return yield* new NoSimulatorBuildError({
				cause: 'No iOS simulator builds found. Ensure you have a build profile with `ios.simulator: true`.',
			});
		}
		return latest;
	});

const downloadArtifact = (buildUrl: string, tempDir: string) =>
	Effect.gen(function* () {
		const tarPath = path.join(tempDir, 'build.tar.gz');
		yield* Effect.try({
			try: () =>
				execFileSync('curl', ['-L', '-o', tarPath, buildUrl], {
					stdio: 'inherit',
				}),
			catch: cause => new DownloadError({cause}),
		});
		return tarPath;
	});

const extractApp = (tarPath: string, tempDir: string) =>
	Effect.gen(function* () {
		yield* Effect.try({
			try: () =>
				execFileSync('tar', ['-xzf', tarPath, '-C', tempDir], {
					stdio: 'inherit',
				}),
			catch: cause => new ExtractError({cause}),
		});

		const findApp = (dir: string): string | null => {
			for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
				const full = path.join(dir, entry.name);
				if (entry.name.endsWith('.app')) return full;
				if (entry.isDirectory()) {
					const found = findApp(full);
					if (found) return found;
				}
			}
			return null;
		};

		const appPath = findApp(tempDir);
		if (!appPath) {
			return yield* new ExtractError({
				cause: 'No .app bundle found in extracted archive.',
			});
		}
		return appPath;
	});

const installOnSimulator = (appPath: string) =>
	Effect.try({
		try: () =>
			execFileSync('xcrun', ['simctl', 'install', 'booted', appPath], {
				stdio: 'inherit',
			}),
		catch: cause =>
			new InstallError({
				cause: `Failed to install on simulator. Is a simulator booted? Try running \`native-agent device start -p ios\` first.\n${cause}`,
			}),
	});

export const installEasIosEffect = () =>
	Effect.gen(function* () {
		yield* Effect.logInfo('Fetching EAS builds...');
		const builds = yield* getEasBuilds();

		yield* Effect.logInfo('Finding simulator build...');
		const build = yield* findSimulatorBuild(builds);
		yield* Effect.logInfo(
			`Found build: ${build.appVersion ?? build.id} (${build.buildProfile})`,
		);

		const tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), 'native-agent-'),
		);

		yield* Effect.ensuring(
			Effect.gen(function* () {
				yield* Effect.logInfo('Downloading build artifact...');
				const tarPath = yield* downloadArtifact(
					build.artifacts.buildUrl,
					tempDir,
				);

				yield* Effect.logInfo('Extracting app...');
				const appPath = yield* extractApp(tarPath, tempDir);

				yield* Effect.logInfo('Installing on simulator...');
				yield* installOnSimulator(appPath);

				yield* Effect.logInfo('Install complete!');
			}),
			Effect.sync(() => {
				fs.rmSync(tempDir, {recursive: true, force: true});
			}),
		);
	});
