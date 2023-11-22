import * as path from 'path';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions';

module.exports = {
	mode: 'production',
	target: 'web',
	entry: path.join(__dirname, 'src/widgets.browser.ts'),
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					onlyCompileBundledFiles: true
				}
			},
			{
				test: /\.(png|jpg|gif|svg)$/i,
				loader: 'url-loader'
			}
		]
	},
	resolve: {
		extensions: ['.ts']
        alias: {
            '~': path.resolve('./node_modules')
        }
	},
	output: {
		filename: 'widgets.bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
} as WebpackOptions;
