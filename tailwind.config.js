/** @type {import('tailwindcss').Config} */

import {
	scopedPreflightStyles,
	isolateForComponents, // there are also isolateInsideOfContainer and isolateOutsideOfContainer
} from 'tailwindcss-scoped-preflight';

const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
	presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
	safelist: ['overflow-hidden'],
	prefix: 'tw-',
	content: ['./src/**/*.{html,ts}', './components/**/*.{html,ts}'],
	theme: {
		fontFamily: { body: ['rubik', 'Open Sans', 'sans-serif'] },
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				purple: 'var(--color-purple)',
				lightpurple: 'var(--color-lightpurple)',
				brightpurple: 'var(--color-brightpurple)',
				buttonhover: 'var(--color-buttonhover)',
				red: {
					DEFAULT: 'var(--color-red)',
					300: 'var(--color-lightred)',
				},
				pink: 'var(--color-pink)',
				green:{
					DEFAULT: 'var(--color-green)',
					400: '#66BB6A',
				},
				yellow: 'var(--color-yellow)',
				white: 'var(--color-white)',
				lightgreen: 'var(--color-lightgreen)',
				oebblack: 'var(--color-black)',
				link: 'var(--color-link)',
				oebgrey: 'var(--color-lightgray)',
				darkgrey: 'var(--color-darkgray)',
				grey: {
					DEFAULT: '#808080',
					40: '#666666',
					85: '#d9d9d9',
				},
			},
			gridTemplateColumns: {
				badges: 'repeat(auto-fill, minmax(320px, 1fr))',
			},
		},
	},
	plugins: [
		scopedPreflightStyles({
			isolationStrategy: isolateForComponents(
				// selector string or array of selectors - the less/shorter - the better
				['.oeb'],
				// every strategy provides the same options (optional) to fine tune the transformation
				{
					// ignore: ["html", ":host", "*"], // when used, these will not be affected by the transformation
					// remove: [":before", ":after"], // this can remove mentioned rules completely
				},
			),
		}),
		require('tailwindcss-animate'),
	],
};
