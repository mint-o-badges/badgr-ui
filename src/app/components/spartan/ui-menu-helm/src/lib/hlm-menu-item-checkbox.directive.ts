import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnMenuItemCheckboxDirective } from '@spartan-ng/brain/menu';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmMenuItemCheckbox]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [
		{
			directive: BrnMenuItemCheckboxDirective,
			inputs: ['disabled: disabled', 'checked: checked'],
			outputs: ['triggered: triggered'],
		},
	],
})
export class HlmMenuItemCheckboxDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-group tw-w-full tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2 tw-text-sm tw-outline-none tw-transition-colors hover:tw-bg-accent hover:tw-text-accent-foreground focus-visible:tw-bg-accent focus-visible:tw-text-accent-foreground disabled:tw-pointer-events-none disabled:tw-opacity-50',
			this.userClass(),
		),
	);
}
