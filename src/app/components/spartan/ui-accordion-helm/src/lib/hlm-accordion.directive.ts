import { Directive, computed, inject, input } from '@angular/core';
import { BrnAccordion } from '@spartan-ng/brain/accordion';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
	selector: '[hlmAccordion], hlm-accordion',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [{ directive: BrnAccordion, inputs: ['type', 'dir', 'orientation'] }],
})
export class HlmAccordion {
	private readonly _brn = inject(BrnAccordion);

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('tw-flex', this._brn.orientation() === 'horizontal' ? 'tw-flex-row' : 'tw-flex-col', this.userClass()),
	);
}
