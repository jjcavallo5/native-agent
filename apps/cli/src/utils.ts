import type {Browser} from 'webdriverio';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const SELECTORS = (target: string) => [
	`//*[@text="${target}"]`,
	`//*[@hint="${target}"]`,
	`//*[@content-desc="${target}"]`,
];

export const findElement = async (driver: Browser, target: string) => {
	for (const selector of SELECTORS(target)) {
		const el = await driver.$(selector);
		if (await el.isDisplayed()) return el;
	}
	throw new Error(`Element not found: "${target}"`);
};

export const findAllElements = async (driver: Browser, target: string) => {
	for (const selector of SELECTORS(target)) {
		const els = await driver.$$(selector);
		const displayed = [];
		for (const el of els) {
			if (await el.isDisplayed()) displayed.push(el);
		}
		if (displayed.length > 0) return displayed;
	}
	throw new Error(`Element not found: "${target}"`);
};
