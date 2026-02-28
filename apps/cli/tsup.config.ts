import {defineConfig} from 'tsup';
import pkg from './package.json' with {type: 'json'};
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	target: 'node18',
	outDir: 'dist',
	clean: true,
	splitting: false,
	banner: {js: '#!/usr/bin/env node'},
	noExternal: ['@native-agent/server', '@native-agent/devices'],
	define: {
		'process.env.VERSION': JSON.stringify(pkg.version),
	},
	esbuildOptions(options) {
		options.alias = {
			'@': path.resolve(__dirname, '../../packages/server/src'),
		};
	},
});
