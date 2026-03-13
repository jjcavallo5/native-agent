const SERVER = 'http://localhost:8647';

export const tap = async (options: {x: string; y: string}) => {
	const res = await fetch(`${SERVER}/tap`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			x: parseFloat(options.x),
			y: parseFloat(options.y),
		}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
