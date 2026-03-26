import { execSync, spawn } from 'child_process';
import { Effect, Schema, Data } from 'effect'

const DevicesSchema = Schema.Struct({
	data: Schema.Record({
		key: Schema.String,
		value: Schema.List(Schema.Struct({
			dataPath: Schema.String,
			dataPathSize: Schema.Number,
			logPath: Schema.String,
			udid: Schema.String,
			isAvailable: Schema.Boolean,
			deviceTypeIdentifier: Schema.String,
			state: Schema.String,
			name: Schema.String,
		}))
	})
})

const RuntimesSchema = Schema.Struct({
	runtimes: Schema.List(Schema.Struct({
		isAvailable: Schema.Boolean,
		version: Schema.String,
		isInternal: Schema.Boolean,
		buildversion: Schema.String,
		supportedArchitectures: Schema.List(Schema.String),
		supportedDeviceTypes: Schema.List(Schema.Struct({
			bundlePath: Schema.String,
			name: Schema.String,
			identifier: Schema.String,
			productFamily: Schema.String
		})),
		identifier: Schema.String,
		platform: Schema.String,
		bundlePath: Schema.String,
		runtimeRoot: Schema.String,
		lastUsage: Schema.Record({
			key: Schema.String,
			value: Schema.Date,
		}),
		name: Schema.String
	}))
})

class DevicesError extends Data.TaggedError('DevicesError')<{ cause: unknown }> { }
class RuntimesError extends Data.TaggedError('RuntimesError')<{ cause: unknown }> { }

const getDevices = Effect.gen(function*() {
	const output = yield* Effect.try({
		try: () => JSON.parse(execSync('xcrun simctl list devices available -j').toString()),
		catch: (cause) => new DevicesError({ cause })
	})
	return yield* Schema.decodeUnknown(DevicesSchema)(output);
});

const getRuntimes = Effect.gen(function*() {
	const output = yield* Effect.try({
		try: () => JSON.parse(execSync('xcrun simctl list runtimes ios available -j').toString()),
		catch: (cause) => new RuntimesError({ cause })
	})
	return yield* Schema.decodeUnknown(RuntimesSchema)(output);
});


export const startIos = async ({ headless }: { headless?: boolean } = {}) => {
	const devices = Effect.runSync(getDevices);
	const runtimes = Effect.runSync(getRuntimes);
	console.log(devices)
	console.log(runtimes)
	return

	// Get the latest available iOS runtime so we pick a compatible simulator
	const latestRuntime: string | undefined = runtimesData.runtimes?.length
		? runtimesData.runtimes[runtimesData.runtimes.length - 1].identifier
		: undefined;

	let found: { udid: string; name: string; state: string } | null = null;

	// First, try to find an iPhone on the latest runtime
	if (latestRuntime && data.devices[latestRuntime]) {
		for (const device of data.devices[latestRuntime]) {
			if (device.name.includes('iPhone')) {
				found = { udid: device.udid, name: device.name, state: device.state };
				break;
			}
		}
	}

	// Fallback: any iPhone simulator
	if (!found) {
		for (const runtime of Object.keys(data.devices)) {
			const devices = data.devices[runtime];
			for (const device of devices) {
				if (device.name.includes('iPhone')) {
					found = { udid: device.udid, name: device.name, state: device.state };
					break;
				}
			}
			if (found) break;
		}
	}

	if (!found) {
		throw new Error('No available iPhone simulator found');
	}

	if (found.state !== 'Booted') {
		execSync(`xcrun simctl boot ${found.udid}`, {
			stdio: headless ? 'ignore' : 'inherit',
		});
	}

	if (!headless) {
		spawn('open', ['-a', 'Simulator'], { stdio: 'inherit' });
	}

	return found;
};

export const stopIos = async ({ udid }: { udid: string }) => {
	execSync(`xcrun simctl shutdown ${udid}`, { stdio: 'inherit' });
};
