import {spawn} from 'bun';

export {getDriver} from './driver';

export const startAppium = () => {
	return spawn(['appium'], {
		stdio: ['inherit', 'inherit', 'inherit'],
	});
};
