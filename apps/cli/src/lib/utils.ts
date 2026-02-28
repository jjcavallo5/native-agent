import {fileURLToPath} from 'bun';
import {readFileSync} from 'fs';
import {dirname, join} from 'path';

export const getVersion = () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const packageJsonPath = join(__dirname, '../../package.json');
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
	return packageJson.version as string;
};
