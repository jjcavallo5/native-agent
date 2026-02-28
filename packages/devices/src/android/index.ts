import { execSync, spawn } from 'child_process';

export const startAndroid = async () => {
  const androidHome = process.env.ANDROID_HOME;
  if (!androidHome) {
    throw new Error('ANDROID_HOME environment variable is not set');
  }

  // Get the latest AVD device name
  const avdOutput = execSync(
    `${androidHome}/cmdline-tools/latest/bin/avdmanager list avd`,
  ).toString();

  const nameLines = avdOutput.split('\n').filter(line => line.includes('Name'));
  const lastNameLine = nameLines[nameLines.length - 1];
  if (!lastNameLine) {
    throw new Error('No AVD devices found');
  }

  const device = lastNameLine.replace(/Name:\s*/, '').trim();

  // Launch the emulator with the device
  const emulator = spawn(`${androidHome}/emulator/emulator`, ['-avd', device], {
    stdio: 'inherit',
  });

  return emulator;
};
