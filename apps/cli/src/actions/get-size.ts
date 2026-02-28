const SERVER = 'http://localhost:8647';

export const getSize = async () => {
	const res = await fetch(`${SERVER}/get-size`, {method: 'POST'});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
