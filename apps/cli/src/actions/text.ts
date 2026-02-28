const SERVER = 'http://localhost:8647';

export const text = async (text: string, options: {target: string}) => {
	const res = await fetch(`${SERVER}/text`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({target: options.target, text}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
