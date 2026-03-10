const SERVER = 'http://localhost:8647';

export const key = async (keyName: string) => {
	const res = await fetch(`${SERVER}/key`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({key: keyName}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
