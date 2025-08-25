import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnTabsList } from '@spartan-ng/brain/tabs';
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
	hostDirectives: [BrnTabsList],
	template: '<ng-content/>',
	host: {
		'[class]': '_computedClass()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmTabsList {
	public readonly orientation = input<ListVariants['orientation']>('horizontal');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(listVariants({ orientation: this.orientation() }), this.userClass()),
	);
}
