import { Component, Input, booleanAttribute, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-label',
	standalone: true,
	template: ` <ng-content /> `,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuLabelComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-block tw-px-2 tw-py-1.5 tw-text-sm tw-font-semibold', this._inset() && 'tw-pl-8', this.userClass()),
	);

	private readonly _inset = signal<ClassValue>(false);
	@Input({ transform: booleanAttribute })
	set inset(value: boolean) {
		this._inset.set(value);
	}
}
