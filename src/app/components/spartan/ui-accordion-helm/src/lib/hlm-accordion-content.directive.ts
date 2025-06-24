import { Directive, computed, inject, input } from '@angular/core';
import { BrnAccordionContentComponent } from '@spartan-ng/brain/accordion';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmAccordionContent],brn-accordion-content [hlm], hlm-accordion-content:not(notHlm)',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmAccordionContentDirective {
	private readonly _brn = inject(BrnAccordionContentComponent, { optional: true });

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() => {
		const gridRows = this._brn?.state() === 'open' ? 'tw-grid-rows-[1fr]' : 'tw-grid-rows-[0fr]';
		return hlm('tw-text-sm tw-transition-all tw-grid', gridRows, this.userClass());
	});

	constructor() {
		this._brn?.setClassToCustomElement('tw-pt-1 tw-pb-4');
	}
}
