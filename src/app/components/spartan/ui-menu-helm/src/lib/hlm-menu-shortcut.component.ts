import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-shortcut',
	standalone: true,
	template: ` <ng-content /> `,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuShortcutComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-ml-auto tw-font-light tw-text-xs tw-tracking-widest tw-opacity-60', this.userClass()),
	);
}
