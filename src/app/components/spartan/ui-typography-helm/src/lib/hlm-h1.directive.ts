import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

export const hlmH1 = 'md:tw-text-[46px] md:tw-leading-[55.2px] tw-text-[30px] tw-leading-[36px]';

@Directive({
	selector: '[hlmH1]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmH1Directive {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(hlmH1, this.userClass()));
}
