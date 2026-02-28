const SERVER = 'http://localhost:8647';

export const click = async (target: string) => {
	const res = await fetch(`${SERVER}/click`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({target}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
