/** @type {import('tailwindcss').Config} */

import {
	scopedPreflightStyles,
	isolateForComponents, // there are also isolateInsideOfContainer and isolateOutsideOfContainer
} from 'tailwindcss-scoped-preflight';

const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
	presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
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
				green: {
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
				lightgrey: 'var(--color-lightgray)',
				grey: {
					DEFAULT: '#808080',
					40: '#666666',
					85: '#d9d9d9',
				},
			},
			gridTemplateColumns: {
				badges: 'repeat(auto-fill, minmax(320px, 1fr))',
				issuer: 'repeat(auto-fill, minmax(450px, 1fr))',
				myIssuers: 'repeat(auto-fit, minmax(600px, 600px))',
				myIssuersMobile: 'repeat(auto-fit, minmax(300px, 1fr))',
				learningpaths: 'repeat(auto-fill, minmax(340px, 1fr))',
				learningpathsBackpack: 'repeat(auto-fill, minmax(392px, 392px))',
				badgesLp: 'repeat(auto-fill, minmax(290px, 1fr))',
				learningpathsSmall: 'repeat(auto-fill, minmax(208px, 1fr))',
			},
			animation: {
				'spin-slow': 'spin 5000ms linear infinite',
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
