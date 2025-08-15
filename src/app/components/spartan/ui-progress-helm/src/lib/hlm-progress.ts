import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmProgress],brn-progress[hlm]',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmProgress {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-inline-flex tw-bg-secondary tw-relative tw-h-4 tw-w-full tw-overflow-hidden tw-rounded-full',
			this.userClass(),
		),
	);
}
