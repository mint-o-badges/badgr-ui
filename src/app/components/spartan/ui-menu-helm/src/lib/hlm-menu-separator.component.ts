import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-separator',
	standalone: true,
	template: '',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmMenuSeparatorComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm('tw-block tw--mx-1 tw-my-1 tw-h-px tw-bg-muted', this.userClass()));
}
