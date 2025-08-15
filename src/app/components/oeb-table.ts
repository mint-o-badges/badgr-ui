import { Directive } from '@angular/core';
import { provideHlmTableConfig } from '@spartan-ng/helm/table';

@Directive({
	selector: 'table[oeb-table]',
	providers: [
		provideHlmTableConfig({
			table: 'tw-w-full tw-mb-8 tw-text-lg tw-text-left tw-rounded-lg tw-border tw-border-solid tw-border-purple tw-border-separate tw-bg-purple',
			thead: 'tw-font-semibold tw-text-white',
			tbody: 'tw-bg-white',
			tfoot: '',
			tr: '[&:last-child_td]:tw-border-none',
			th: 'tw-px-4 tw-py-2 tw-leading-[3rem] tw-border-b tw-border-solid tw-border-purple',
			td: 'tw-px-4 tw-py-2 tw-leading-10 tw-border-b tw-border-solid tw-border-purple tw-align-top',
			caption: '',
		}),
	],
})
export class OebTable {}

@Directive({
	selector: 'table[oeb-table-secondary]',
	providers: [
		provideHlmTableConfig({
			table: 'tw-w-full tw-mb-8 tw-text-lg tw-text-left tw-rounded-lg tw-border tw-border-solid tw-border-gray-100 tw-border-separate tw-bg-gray-100',
			thead: 'tw-font-semibold tw-text-oebblack',
			tbody: 'tw-bg-white',
			tfoot: '',
			tr: '[&:last-child_td]:tw-border-none',
			th: 'tw-px-4 tw-py-2 tw-leading-[3rem] tw-border-b tw-border-solid tw-border-gray-100',
			td: 'tw-px-4 tw-py-2 tw-leading-10 tw-border-b tw-border-solid tw-border-gray-100 tw-align-top',
			caption: '',
		}),
	],
})
export class OebTableSecondary {}

@Directive({
	selector: 'table[oeb-table-highlight]',
	providers: [
		provideHlmTableConfig({
			table: 'tw-w-full tw-mb-8 tw-text-lg tw-text-left tw-rounded-lg tw-border tw-border-solid tw-border-gray-100 tw-border-separate tw-bg-[var(--color-mint)]',
			thead: 'tw-font-semibold tw-text-oebblack',
			tbody: 'tw-bg-white',
			tfoot: '',
			tr: '[&:last-child_td]:tw-border-none',
			th: 'tw-px-4 tw-py-2 tw-leading-[3rem] tw-border-b tw-border-solid tw-border-gray-100',
			td: 'tw-px-4 tw-py-2 tw-leading-10 tw-border-b tw-border-solid tw-border-gray-100 tw-align-top',
			caption: '',
		}),
	],
})
export class OebTableHighlight {}

export const OebTableImports = [OebTable, OebTableSecondary, OebTableHighlight] as const;
