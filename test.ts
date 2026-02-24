const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.contractory',
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: 4723,
  logLevel: 'info',
  capabilities,
};

const clickButton = async (driver: any, btnTxt: string) => {
  const btn = await driver.$(`//*[@text="${btnTxt}"]`);
  await btn.waitForDisplayed();
  await btn.click();
}

const enterText = async (driver: any, selectorTxt: string, toEnter: string) => {
  const field = await driver.$(`//*[@text="${selectorTxt}"]`);
  await field.waitForDisplayed();
  await field.setValue(toEnter);
}

async function runTest() {
  const driver = await remote(wdOpts);
  try {
    // Press "Sign In"
    await clickButton(driver, "Sign In")

    // Press "Email"
    await enterText(driver, "Email", process.env.LOGIN_EMAIL)

    // Press "Password"
    await enterText(driver, "Password", process.env.LOGIN_PASS!)

    // Press "Sign In"
    await clickButton(driver, "Sign In")

    // Press "Profile"
    await clickButton(driver, "Profile")

    // Press "Change Name"
    await clickButton(driver, "Change Name")

    // Enter first name
    await enterText(driver, "First", "Tyler")

    // Enter last name
    await enterText(driver, "Last", "Buchanan")

    // Press "Save"
    await clickButton(driver, "Save")

  } finally {
    await driver.pause(100000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);
