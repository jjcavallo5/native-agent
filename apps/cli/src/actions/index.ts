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
		.description('Click on the screen at relative x,y location')
		.option(
			'-x <value>',
			'X location to click, normalized to device width (0.0 = left side, 1.0 = right side)',
		)
		.option(
			'-y <value>',
			'Y location to click, normalized to device height (0.0 = top, 1.0 = bottom)',
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
		.description('Swipe the screen for scrolling')
		.requiredOption(
			'--startX <value>',
			'X location to start, normalized to device width (0.0 = left side, 1.0 = right side)',
		)
		.requiredOption(
			'--startY <value>',
			'Y location to start, normalized to device height (0.0 = top, 1.0 = bottom)',
		)
		.requiredOption(
			'--endX <value>',
			'X location to end, normalized to device width (0.0 = left side, 1.0 = right side)',
		)
		.requiredOption(
			'--endY <value>',
			'Y location to end, normalized to device height (0.0 = top, 1.0 = bottom)',
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
