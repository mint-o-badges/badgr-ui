import eslintPluginPrettier from 'eslint-plugin-prettier';
import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintPluginTemplate from '@angular-eslint/eslint-plugin-template';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
	{
		ignores: ['**/node_modules/**', '**/src/thirdparty/**', '**/*.spec.ts'],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
				ecmaVersion: 'latest',
			},
		},
		plugins: {
			'@angular-eslint': angularEslintPlugin,
			'@typescript-eslint': typescriptEslint,
			prettier: eslintPluginPrettier,
		},
		rules: {
			// Angular ESLint rules
			...angularEslintPlugin.configs['recommended'].rules,

			// TypeScript ESLint rules
			...typescriptEslint.configs.recommended.rules,

			// Prettier integration
			'prettier/prettier': 'error',

			// Your custom override
			'@angular-eslint/prefer-inject': 'warn',
			'@angular-eslint/no-input-rename': 'warn',
			'@angular-eslint/no-output-on-prefix': 'warn',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
	{
		files: ['**/*.html'],
		languageOptions: {
			parser: angularEslintTemplateParser,
		},
		plugins: {
			'@angular-eslint/template': angularEslintPluginTemplate,
		},
		rules: {
			...angularEslintPluginTemplate.configs['recommended'].rules,
		},
	},
];
