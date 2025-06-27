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
				// Note: Purple is referred to as "blue" in the figma style guide
				purple: {
					DEFAULT: 'var(--color-purple)',
					50: 'var(--color-purple-50)',
					100: 'var(--color-purple-100)',
					200: 'var(--color-purple-200)',
					300: 'var(--color-purple-300)',
					400: 'var(--color-purple-400)',
					500: 'var(--color-purple-500)',
					600: 'var(--color-purple-600)',
					700: 'var(--color-purple-700)',
					800: 'var(--color-purple-800)',
					900: 'var(--color-purple-900)',
					950: 'var(--color-purple-950)',
				},
				lightpurple: 'var(--color-lightpurple)',
				brightpurple: 'var(--color-brightpurple)',
				buttonhover: 'var(--color-buttonhover)',
				red: {
					DEFAULT: 'var(--color-red)',
					300: 'var(--color-lightred)',
				},
				pink: {
					DEFAULT: 'var(--color-pink)',
					50: 'var(--color-pink-50)',
					100: 'var(--color-pink-100)',
					200: 'var(--color-pink-200)',
					300: 'var(--color-pink-300)',
					400: 'var(--color-pink-400)',
					500: 'var(--color-pink-500)',
					600: 'var(--color-pink-600)',
					700: 'var(--color-pink-700)',
					800: 'var(--color-pink-800)',
					900: 'var(--color-pink-900)',
					950: 'var(--color-pink-950)',
				},
				green: {
					DEFAULT: 'var(--color-green)',
					50: 'var(--color-green-50)',
					100: 'var(--color-green-100)',
					200: 'var(--color-green-200)',
					300: 'var(--color-green-300)',
					400: 'var(--color-green-400)',
					500: 'var(--color-green-500)',
					600: 'var(--color-green-600)',
					700: 'var(--color-green-700)',
					800: 'var(--color-green-800)',
					900: 'var(--color-green-900)',
					950: 'var(--color-green-950)',
					// 400: '#66BB6A',
				},
				yellow: {
					DEFAULT: 'var(--color-yellow)',
					50: 'var(--color-yellow-50)',
					100: 'var(--color-yellow-100)',
					200: 'var(--color-yellow-200)',
					300: 'var(--color-yellow-300)',
					400: 'var(--color-yellow-400)',
					500: 'var(--color-yellow-500)',
					600: 'var(--color-yellow-600)',
					700: 'var(--color-yellow-700)',
					800: 'var(--color-yellow-800)',
					900: 'var(--color-yellow-900)',
					950: 'var(--color-yellow-950)',
				},
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
				// Note: referred to as "neutral" in the color guide
				gray: {
					DEFAULT: 'var(--color-gray-400)',
					50: 'var(--color-gray-50)',
					100: 'var(--color-gray-100)',
					200: 'var(--color-gray-200)',
					300: 'var(--color-gray-300)',
					400: 'var(--color-gray-400)',
					500: 'var(--color-gray-500)',
					600: 'var(--color-gray-600)',
					700: 'var(--color-gray-700)',
					800: 'var(--color-gray-800)',
					900: 'var(--color-gray-900)',
					950: 'var(--color-gray-950)',
				},

				error: {
					DEFAULT: 'var(--color-error-400)',
					50: 'var(--color-error-50)',
					100: 'var(--color-error-100)',
					200: 'var(--color-error-200)',
					300: 'var(--color-error-300)',
					400: 'var(--color-error-400)',
					500: 'var(--color-error-500)',
					600: 'var(--color-error-600)',
					700: 'var(--color-error-700)',
					800: 'var(--color-error-800)',
					900: 'var(--color-error-900)',
					950: 'var(--color-error-950)',
				},
				warning: {
					DEFAULT: 'var(--color-warning-400)',
					50: 'var(--color-warning-50)',
					100: 'var(--color-warning-100)',
					200: 'var(--color-warning-200)',
					300: 'var(--color-warning-300)',
					400: 'var(--color-warning-400)',
					500: 'var(--color-warning-500)',
					600: 'var(--color-warning-600)',
					700: 'var(--color-warning-700)',
					800: 'var(--color-warning-800)',
					900: 'var(--color-warning-900)',
					950: 'var(--color-warning-950)',
				},
				success: {
					DEFAULT: 'var(--color-success-400)',
					50: 'var(--color-success-50)',
					100: 'var(--color-success-100)',
					200: 'var(--color-success-200)',
					300: 'var(--color-success-300)',
					400: 'var(--color-success-400)',
					500: 'var(--color-success-500)',
					600: 'var(--color-success-600)',
					700: 'var(--color-success-700)',
					800: 'var(--color-success-800)',
					900: 'var(--color-success-900)',
					950: 'var(--color-success-950)',
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
