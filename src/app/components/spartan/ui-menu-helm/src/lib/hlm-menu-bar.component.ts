import { Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnMenuBarDirective } from '@spartan-ng/ui-menu-brain';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-bar',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenuBarDirective],
	template: '<ng-content/>',
})
export class HlmMenuBarComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-border-border tw-flex tw-h-10 tw-items-center tw-space-x-1 tw-rounded-md tw-border tw-bg-background tw-p-1',
			this.userClass(),
		),
	);
}
