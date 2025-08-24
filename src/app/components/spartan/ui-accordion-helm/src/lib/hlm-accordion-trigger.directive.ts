import { Directive, computed, input } from '@angular/core';
import { BrnAccordionTrigger } from '@spartan-ng/brain/accordion';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmAccordionTrigger]',
	standalone: true,
	host: {
		'[style.--tw-ring-offset-shadow]': '"0 0 #000"',
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnAccordionTrigger],
})
export class HlmAccordionTrigger {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-w-40 tw-focus-visible:outline-none tw-text-sm tw-focus-visible:ring-1 tw-focus-visible:ring-ring tw-focus-visible:ring-offset-2 tw-flex tw-flex-1 tw-items-center tw-justify-between tw-py-2 tw-px-1 tw-font-medium tw-underline-offset-4 hover:tw-underline [&[data-state=open]>[hlmAccordionIcon]]:tw-rotate-180 [&[data-state=open]>[hlmAccIcon]]:tw-rotate-180',
			this.userClass(),
		),
	);
}
