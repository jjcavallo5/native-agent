import {main} from 'appium';

export const startAppium = async ({
	port,
	address,
}: {
	port?: number;
	address?: string;
}) => {
	return main({
		port: port ?? 4723,
		address: address ?? '0.0.0.0',
	});
};
