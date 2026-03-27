import {execSync, spawn} from 'child_process';
import {Effect, Schema, Data, Logger, LogLevel} from 'effect';

const DevicesSchema = Schema.Struct({
	devices: Schema.Record({
		key: Schema.String,
		value: Schema.Array(
			Schema.Struct({
				dataPath: Schema.String,
				dataPathSize: Schema.Number,
				logPath: Schema.String,
				udid: Schema.String,
				isAvailable: Schema.Boolean,
				deviceTypeIdentifier: Schema.String,
				state: Schema.String,
				name: Schema.String,
			}),
		),
	}),
});

const RuntimesSchema = Schema.Struct({
	runtimes: Schema.Array(
		Schema.Struct({
			isAvailable: Schema.Boolean,
			version: Schema.String,
			isInternal: Schema.Boolean,
			buildversion: Schema.String,
			supportedArchitectures: Schema.Array(Schema.String),
			supportedDeviceTypes: Schema.Array(
				Schema.Struct({
					bundlePath: Schema.String,
					name: Schema.String,
					identifier: Schema.String,
					productFamily: Schema.String,
				}),
			),
			identifier: Schema.String,
			platform: Schema.String,
			bundlePath: Schema.String,
			runtimeRoot: Schema.String,
			lastUsage: Schema.Record({
				key: Schema.String,
				value: Schema.Date,
			}),
			name: Schema.String,
		}),
	),
});

class DevicesError extends Data.TaggedError('DevicesError')<{cause: unknown}> {}
class RuntimesError extends Data.TaggedError('RuntimesError')<{
	cause: unknown;
}> {}

const getDevices = () =>
	Effect.gen(function* () {
		const output = yield* Effect.try({
			try: () =>
				JSON.parse(
					execSync('xcrun simctl list devices available -j').toString(),
				),
			catch: cause => new DevicesError({cause}),
		});
		yield* Effect.logDebug(output);
		return yield* Schema.decodeUnknown(DevicesSchema)(output);
	});

const getRuntimes = () =>
	Effect.gen(function* () {
		const output = yield* Effect.try({
			try: () =>
				JSON.parse(
					execSync('xcrun simctl list runtimes ios available -j').toString(),
				),
			catch: cause => new RuntimesError({cause}),
		});
		yield* Effect.logDebug(output);
		return yield* Schema.decodeUnknown(RuntimesSchema)(output);
	});

export const startIosEffect = ({headless}: {headless?: boolean} = {}) =>
	Effect.gen(function* () {
		// 1. Get devices & runtimes
		const {devices} = yield* getDevices();
		const {runtimes} = yield* getRuntimes();

		// 2. Get the latest available iOS runtime so we pick a compatible simulator
		const latestRuntime = runtimes.at(-1)?.identifier;
		if (!latestRuntime) {
			return yield* new RuntimesError({cause: 'No runtimes returned'});
		}

		// 3. Find devices with matching runtimes
		const runtimeIds = runtimes.map(r => r.identifier);
		const matchingDevices = Object.keys(devices)
			.map(runtime => (runtimeIds.includes(runtime) ? devices[runtime] : null))
			.filter(d => !!d)
			.flat();

		// 4. Return device with latest runtime (should be last)
		const found = matchingDevices.at(-1);
		if (!found || matchingDevices.length === 0) {
			return yield* new DevicesError({cause: 'No device/runtime match found'});
		}

		// 5. Boot it
		if (found.state !== 'Booted') {
			execSync(`xcrun simctl boot ${found.udid}`, {
				stdio: headless ? 'ignore' : 'inherit',
			});
		}
		if (!headless) {
			spawn('open', ['-a', 'Simulator'], {stdio: 'inherit'});
		}

		// 7. Return it
		return found;
	});

export const stopIos = async ({udid}: {udid: string}) => {
	execSync(`xcrun simctl shutdown ${udid}`, {stdio: 'inherit'});
};
