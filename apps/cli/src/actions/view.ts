const SERVER = 'http://localhost:8647';

export const view = async (options: {output?: string}) => {
	let url = `${SERVER}/view`;
	if (options.output) {
		url += `?output=${encodeURIComponent(options.output)}`;
	}
	const res = await fetch(url, {method: 'GET'});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
