import {createInterface} from 'readline';
import {Effect} from 'effect';

export const confirmPrompt = (message: string) =>
	Effect.async<boolean>(resume => {
		const rl = createInterface({input: process.stdin, output: process.stdout});
		let answered = false;
		rl.question(`${message} (y/n) `, answer => {
			answered = true;
			rl.close();
			resume(Effect.succeed(/^y(es)?$/i.test(answer.trim())));
		});
		rl.on('close', () => {
			if (!answered) {
				resume(Effect.succeed(false));
			}
		});
	});
