import { Directive, computed, input } from '@angular/core';
import { BrnAccordionItem } from '@spartan-ng/brain/accordion';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmAccordionItem],brn-accordion-item[hlm],hlm-accordion-item',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [
		{
			directive: BrnAccordionItem,
			inputs: ['isOpened'],
		},
	],
})
export class HlmAccordionItem {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('tw-flex tw-flex-1 tw-flex-col tw-border-b tw-border-border', this.userClass()),
	);
}
