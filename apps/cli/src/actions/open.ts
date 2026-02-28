const SERVER = 'http://localhost:8647';

export const open = async (appId: string) => {
	const res = await fetch(`${SERVER}/open`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({appId}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
