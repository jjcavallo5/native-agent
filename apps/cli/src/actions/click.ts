const SERVER = 'http://localhost:8647';

export const click = async (target: string, options: {index?: string}) => {
	const body: Record<string, unknown> = {target};
	if (options.index !== undefined) {
		body.index = parseInt(options.index, 10);
	}
	const res = await fetch(`${SERVER}/click`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(body),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
