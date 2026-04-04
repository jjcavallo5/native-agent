import {execSync, spawn} from 'child_process';
import {Effect, Schema, Data} from 'effect';
import {confirmPrompt} from '../prompt';

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
class SetupError extends Data.TaggedError('SetupError')<{cause: unknown}> {}

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

const DeviceTypesSchema = Schema.Struct({
	devicetypes: Schema.Array(
		Schema.Struct({
			name: Schema.String,
			identifier: Schema.String,
		}),
	),
});

const getDeviceTypes = () =>
	Effect.gen(function* () {
		const output = yield* Effect.try({
			try: () =>
				JSON.parse(
					execSync('xcrun simctl list devicetypes -j').toString(),
				),
			catch: cause => new SetupError({cause}),
		});
		return yield* Schema.decodeUnknown(DeviceTypesSchema)(output);
	});

const downloadRuntime = () =>
	Effect.gen(function* () {
		const confirmed = yield* confirmPrompt(
			'No iOS simulator runtimes found. Download the latest iOS runtime?',
		);
		if (!confirmed) {
			return yield* new RuntimesError({cause: 'User declined runtime download'});
		}

		yield* Effect.try({
			try: () =>
				execSync('xcodebuild -downloadPlatform iOS', {stdio: 'inherit'}),
			catch: cause => new SetupError({cause}),
		});

		return yield* getRuntimes();
	});

const createSimulator = (runtimeId: string) =>
	Effect.gen(function* () {
		const {devicetypes} = yield* getDeviceTypes();
		const iPhoneTypes = devicetypes.filter(d => d.name.includes('iPhone'));
		const latestIPhone = iPhoneTypes.at(-1);
		if (!latestIPhone) {
			return yield* new SetupError({cause: 'No iPhone device types found'});
		}

		const confirmed = yield* confirmPrompt(
			`No simulators match available runtimes. Create "${latestIPhone.name}"?`,
		);
		if (!confirmed) {
			return yield* new DevicesError({cause: 'User declined simulator creation'});
		}

		yield* Effect.try({
			try: () =>
				execSync(
					`xcrun simctl create "${latestIPhone.name}" ${latestIPhone.identifier} ${runtimeId}`,
				),
			catch: cause => new SetupError({cause}),
		});

		const {devices} = yield* getDevices();
		const runtimeDevices = devices[runtimeId];
		const created = runtimeDevices?.at(-1);
		if (!created) {
			return yield* new SetupError({cause: 'Simulator was created but could not be found'});
		}
		return created;
	});

export const startIosEffect = ({headless}: {headless?: boolean} = {}) =>
	Effect.gen(function* () {
		// 1. Get devices & runtimes
		const {devices} = yield* getDevices();
		let {runtimes} = yield* getRuntimes();

		// 2. If no runtimes, offer to download
		if (runtimes.length === 0) {
			({runtimes} = yield* downloadRuntime());
		}

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

		// 4. If no matching devices, offer to create one
		let found = matchingDevices.at(-1);
		if (!found || matchingDevices.length === 0) {
			found = yield* createSimulator(latestRuntime);
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

		return found;
	});

export const stopIos = async ({udid}: {udid: string}) => {
	execSync(`xcrun simctl shutdown ${udid}`, {stdio: 'inherit'});
};
