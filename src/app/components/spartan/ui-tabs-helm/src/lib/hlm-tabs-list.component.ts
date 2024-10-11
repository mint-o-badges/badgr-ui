import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnTabsListDirective } from '@spartan-ng/ui-tabs-brain';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const listVariants = cva(
	'tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-p-1 tw-text-muted-foreground',
	{
		variants: {
			orientation: {
				horizontal: 'tw-h-10 tw-space-x-1',
				vertical: 'tw-mt-2 tw-flex-col tw-h-fit tw-space-y-1',
			},
		},
		defaultVariants: {
			orientation: 'horizontal',
		},
	},
);
type ListVariants = VariantProps<typeof listVariants>;

@Component({
	selector: 'hlm-tabs-list',
	standalone: true,
	hostDirectives: [BrnTabsListDirective],
	template: '<ng-content/>',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmTabsListComponent {
	public readonly orientation = input<ListVariants['orientation']>('horizontal');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(listVariants({ orientation: this.orientation() }), this.userClass()));
}
