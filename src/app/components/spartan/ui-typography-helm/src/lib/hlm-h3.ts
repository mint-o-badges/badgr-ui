import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

export const hlmH3 = 'md:tw-text-[22px] md:tw-leading-[26.4px] tw-text-[16px] tw-leading-[19.2px]';

@Directive({
	selector: '[hlmH3]',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmH3 {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(hlmH3, this.userClass()));
}
