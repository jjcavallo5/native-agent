import { execSync, spawn } from 'child_process';

export const startIos = async ({ headless }: { headless?: boolean } = {}) => {
  const output = execSync('xcrun simctl list devices available -j').toString();
  const data = JSON.parse(output);

  // Get the latest available iOS runtime so we pick a compatible simulator
  const runtimesOutput = execSync('xcrun simctl list runtimes ios available -j').toString();
  const runtimesData = JSON.parse(runtimesOutput);
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
    execSync(`xcrun simctl boot ${found.udid}`, { stdio: headless ? 'ignore' : 'inherit' });
  }

  if (!headless) {
    spawn('open', ['-a', 'Simulator'], { stdio: 'inherit' });
  }

  return found;
};

export const stopIos = async ({ udid }: { udid: string }) => {
  execSync(`xcrun simctl shutdown ${udid}`, { stdio: 'inherit' });
};
