import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-cmd-input-wrapper',
	standalone: true,
	template: '<ng-content/>',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmCommandInputWrapperComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		// I removed:  [&_hlm-icon]:tw-h-5 [&_hlm-icon]:tw-w-5
		// The icon size can be set through the size attribute on hlmIcon
		hlm('tw-flex tw-space-x-2 tw-items-center tw-border-b tw-border-border tw-px-3', this.userClass()),
	);
}
