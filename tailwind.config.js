/** @type {import('tailwindcss').Config} */

import {
	scopedPreflightStyles,
	isolateForComponents, // there are also isolateInsideOfContainer and isolateOutsideOfContainer
} from 'tailwindcss-scoped-preflight';

const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
//   presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
  safelist: ['overflow-hidden'],
  prefix: 'tw-',
  content: [
    "./src/**/*.{html,ts}",
    './components/**/*.{html,ts}',
  ],
  theme: {
    fontFamily: { body: ["rubik","Open Sans", 'sans-serif']},
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
        red: 'var(--color-red)',
        pink: 'var(--color-pink)',
        green: 'var(--color-green)',
        yellow: 'var(--color-yellow)',
        white: 'var(--color-white)',
        //Spartan
        border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['var(--font-sans)', ...fontFamily.sans],
			},
			keyframes: {
				indeterminate: {
					'0%': {
						transform: 'translateX(-100%) scaleX(0.5)',
					},
					'100%': {
						transform: 'translateX(100%) scaleX(0.5)',
					},
				},
			},
			animation: {
				indeterminate: 'indeterminate 4s infinite ease-in-out',
      },
    },
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents(
        // selector string or array of selectors - the less/shorter - the better
        [
          '.oeb',
        ],
        // every strategy provides the same options (optional) to fine tune the transformation
        {
          // ignore: ["html", ":host", "*"], // when used, these will not be affected by the transformation
          // remove: [":before", ":after"], // this can remove mentioned rules completely
        },
      ),
    }),
    require('tailwindcss-animate')
  ],
}
