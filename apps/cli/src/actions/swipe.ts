const SERVER = 'http://localhost:8647';

export const swipe = async (options: {
	startX: string;
	startY: string;
	endX: string;
	endY: string;
}) => {
	const res = await fetch(`${SERVER}/swipe`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			start: {x: parseFloat(options.startX), y: parseFloat(options.startY)},
			end: {x: parseFloat(options.endX), y: parseFloat(options.endY)},
		}),
	});
	const result = await res.json();
	console.log(JSON.stringify(result, null, 2));
};
