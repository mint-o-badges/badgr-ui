import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

export const hlmA = 'tw-underline !tw-text-link hover:!tw-text-buttonhover tw-cursor-pointer';

@Directive({
	selector: '[hlmA]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmADirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(hlmA, this.userClass()));
}
