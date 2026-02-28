import {spawn} from 'bun';
import {APPIUM_PORT} from '..';

export {getDriver} from './driver';

export const startAppium = ({port = APPIUM_PORT}: {port?: number}) => {
	return spawn(['appium', '-p', `${port}`], {
		stdio: ['inherit', 'inherit', 'inherit'],
	});
};
