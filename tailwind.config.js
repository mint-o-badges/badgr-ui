/** @type {import('tailwindcss').Config} */

import {
  scopedPreflightStyles,
  isolateForComponents, // there are also isolateInsideOfContainer and isolateOutsideOfContainer
} from 'tailwindcss-scoped-preflight';

module.exports = {
  prefix: 'tw-',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: { body: ["rubik","Open Sans", 'sans-serif']},

    extend: {
      colors: {
        purple: 'var(--color-purple)',
        red: 'var(--color-red)',
        pink: 'var(--color-pink)',
        green: 'var(--color-green)',
        yellow: 'var(--color-yellow)',
        white: 'var(--color-white)',
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
  ],
}

