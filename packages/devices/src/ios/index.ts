import { execSync, spawn } from 'child_process';

export const startIos = async ({ headless }: { headless?: boolean } = {}) => {
  const output = execSync('xcrun simctl list devices available -j').toString();
  const data = JSON.parse(output);

  let found: { udid: string; name: string } | null = null;

  for (const runtime of Object.keys(data.devices)) {
    const devices = data.devices[runtime];
    for (const device of devices) {
      if (device.name.includes('iPhone')) {
        found = { udid: device.udid, name: device.name };
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    throw new Error('No available iPhone simulator found');
  }

  execSync(`xcrun simctl boot ${found.udid}`, { stdio: headless ? 'ignore' : 'inherit' });

  if (!headless) {
    spawn('open', ['-a', 'Simulator'], { stdio: 'inherit' });
  }

  return found;
};

export const stopIos = async ({ udid }: { udid: string }) => {
  execSync(`xcrun simctl shutdown ${udid}`, { stdio: 'inherit' });
};
