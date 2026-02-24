import {main} from 'appium';

export const run = async ({
	port,
	address,
}: {
	port?: number;
	address?: string;
}) => {
	await main({
		port: port ?? 4723,
		address: address ?? '0.0.0.0',
	});
};
