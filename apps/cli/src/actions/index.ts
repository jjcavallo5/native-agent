import {Command} from 'commander';

const actions = new Command();

actions
	.command('click')
	.description('Click on an element by specifying target text')
	.argument('<element text>', 'Text label of element to click on');

actions
	.command('tap')
	.description('Click on the screen at relative x,y location')
	.option(
		'-x',
		'X location to click, normalized to device width (0.0 = left side, 1.0 = right side)',
	)
	.option(
		'-y',
		'Y location to click, normalized to device height (0.0 = top, 1.0 = bottom)',
	);

actions
	.command('text')
	.description('Type text into a text input field')
	.argument('<text>', 'Text to type into input')
	.requiredOption('-t, --target', 'Text label of element to type into');

actions
	.command('swipe')
	.description('Swipe the screen for scrolling')
	.requiredOption(
		'-sx, --startX',
		'X location to start, normalized to device width (0.0 = left side, 1.0 = right side)',
	)
	.requiredOption(
		'-sy, --startY',
		'Y location to start, normalized to device height (0.0 = top, 1.0 = bottom)',
	)
	.requiredOption(
		'-ex, --endX',
		'X location to end, normalized to device width (0.0 = left side, 1.0 = right side)',
	)
	.requiredOption(
		'-ey, --endY',
		'Y location to end, normalized to device height (0.0 = top, 1.0 = bottom)',
	);

actions.command('view').description('Get screenshot of the current state');

actions.command('get-size').description('Get viewport dimensions');
