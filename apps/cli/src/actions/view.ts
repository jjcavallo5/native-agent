const SERVER = 'http://localhost:8647';

export const view = async () => {
	const res = await fetch(`${SERVER}/view`, {method: 'POST'});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
