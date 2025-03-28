import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'hlm-select-value,[hlmSelectValue], brn-select-value[hlm]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSelectValueDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'!tw-inline-block ltr:tw-text-left rtl:tw-text-right tw-border-border tw-w-[calc(100%)]] tw-min-w-0 tw-pointer-events-none tw-truncate',
			this.userClass(),
		),
	);
}
