import { Directive } from '@angular/core';
import { injectTableClassesSettable } from '@spartan-ng/ui-core';

@Directive({ standalone: true, selector: '[hlmTable],brn-table[hlm]' })
export class HlmTableDirective {
	private _tableClassesSettable = injectTableClassesSettable({ host: true, optional: true });

	constructor() {
		this._tableClassesSettable?.setTableClasses({
			table: 'tw-flex tw-flex-col tw-text-sm [&_cdk-row:last-child]:tw-border-0',
			headerRow:
				'tw-flex tw-min-w-[100%] tw-w-fit tw-border-b tw-border-border [&.cdk-table-sticky]:tw-bg-background ' +
				'[&.cdk-table-sticky>*]:tw-z-[101] [&.cdk-table-sticky]:before:tw-z-0 [&.cdk-table-sticky]:before:tw-block [&.cdk-table-sticky]:hover:before:tw-bg-muted/50 [&.cdk-table-sticky]:before:tw-absolute [&.cdk-table-sticky]:before:tw-inset-0',
			bodyRow:
				'tw-flex tw-min-w-[100%] tw-w-fit tw-border-b tw-border-border tw-transition-[background-color] hover:tw-bg-muted/50 [&:has([role=checkbox][aria-checked=true])]:tw-bg-muted',
		});
	}
}
