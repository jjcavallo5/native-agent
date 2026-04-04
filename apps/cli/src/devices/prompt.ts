import {createInterface} from 'readline';
import {Effect} from 'effect';

export const confirmPrompt = (message: string) =>
	Effect.async<boolean>(resume => {
		const rl = createInterface({input: process.stdin, output: process.stdout});
		rl.question(`${message} (y/n) `, answer => {
			rl.close();
			resume(Effect.succeed(/^y(es)?$/i.test(answer.trim())));
		});
	});
