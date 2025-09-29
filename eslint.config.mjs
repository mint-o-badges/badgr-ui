import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	...compat.extends(
		'plugin:@angular-eslint/recommended',
		'plugin:@angular-eslint/template/process-inline-templates',
		'plugin:prettier/recommended',
	),
	{
		files: ['**/*.ts'],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: 'script',
			parserOptions: {
				project: ['tsconfig.json'],
				createDefaultProgram: true,
			},
		},
		rules: {
			'@angular-eslint/prefer-inject': 'off',
		},
	},
	...compat.extends('plugin:@angular-eslint/template/recommended'),
	{
		files: ['**/*.html'],
		rules: {},
	},
];
