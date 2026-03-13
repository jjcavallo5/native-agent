import type {Command} from 'commander';
import {click} from './click';
import {key} from './key';
import {tap} from './tap';
import {text} from './text';
import {swipe} from './swipe';
import {view} from './view';
import {getSize} from './get-size';
import {open} from './open';

export const registerActions = (program: Command) => {
	program
		.command('click')
		.description('Click on an element by specifying target text')
		.argument('<element text>', 'Text label of element to click on')
		.option('--index <n>', 'Zero-based index when multiple elements match (default: 0)')
		.action(click);

	program
		.command('key')
		.description('Press a key (Enter, Back, Home, Tab, etc.)')
		.argument('<key>', 'Key name to press')
		.action(key);

	program
		.command('tap')
		.description('Tap the screen at x,y screenshot pixel coordinates')
		.option(
			'-x <value>',
			'X pixel coordinate in screenshot space (screenshot is 768px wide)',
		)
		.option(
			'-y <value>',
			'Y pixel coordinate in screenshot space',
		)
		.action(tap);

	program
		.command('text')
		.description('Type text into a text input field')
		.argument('<text>', 'Text to type into input')
		.option(
			'-t, --target <value>',
			'Text label of element to type into',
		)
		.option('--focused', 'Type into the currently focused element')
		.action(text);

	program
		.command('swipe')
		.description('Swipe the screen using screenshot pixel coordinates')
		.requiredOption(
			'--startX <value>',
			'Starting X pixel coordinate in screenshot space',
		)
		.requiredOption(
			'--startY <value>',
			'Starting Y pixel coordinate in screenshot space',
		)
		.requiredOption(
			'--endX <value>',
			'Ending X pixel coordinate in screenshot space',
		)
		.requiredOption(
			'--endY <value>',
			'Ending Y pixel coordinate in screenshot space',
		)
		.action(swipe);

	program
		.command('view')
		.description('Get screenshot of the current state')
		.option('-o, --output <path>', 'Save screenshot to custom file path')
		.action((options) => view(options));

	program
		.command('get-size')
		.description('Get viewport dimensions')
		.action(getSize);

	program
		.command('open')
		.description('Open an app by its app ID (bundleId on iOS, package ID on Android)')
		.argument('<appId>', 'App identifier to open (e.g. com.android.settings)')
		.action(open);
};
