import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const hlmH2 =
	'md:tw-text-[30px] md:tw-leading-[36px] tw-text-purple tw-text-[20px] tw-leading-[24px]';

@Directive({
	selector: '[hlmH2]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmH2Directive {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(hlmH2, this.userClass()));
}
