const SERVER = 'http://localhost:8647';

export const text = async (text: string, options: {target?: string; focused?: boolean}) => {
	const body: Record<string, unknown> = {text};
	if (options.target) {
		body.target = options.target;
	}
	if (options.focused) {
		body.focused = true;
	}
	const res = await fetch(`${SERVER}/text`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(body),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
