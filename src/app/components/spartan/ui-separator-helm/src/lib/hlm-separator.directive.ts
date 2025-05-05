import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

export type HlmSeparatorOrientation = 'horizontal' | 'vertical';
@Directive({
	selector: '[hlmSeparator],brn-separator[hlm]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmSeparatorDirective {
	public readonly orientation = input<HlmSeparatorOrientation>('horizontal');
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-inline-flex tw-shrink-0 tw-border-0 tw-bg-border',
			this.orientation() === 'horizontal' ? 'tw-h-[1px] tw-w-full' : 'tw-h-full tw-w-[1px]',
			this.userClass(),
		),
	);
}
