const SERVER = 'http://localhost:8647';

export const tap = async (options: {x: string; y: string}) => {
	const sizeRes = await fetch(`${SERVER}/get-size`, {method: 'POST'});
	const {width, height} = await sizeRes.json();

	const absX = Math.round(parseFloat(options.x) * width);
	const absY = Math.round(parseFloat(options.y) * height);

	const res = await fetch(`${SERVER}/tap`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({x: absX, y: absY}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
