import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnMenuBar } from '@spartan-ng/brain/menu';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-menu-bar',
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [BrnMenuBar],
	template: '<ng-content/>',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmMenuBar {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-border-border tw-flex tw-h-10 tw-items-center tw-gap-1 tw-rounded-md tw-border tw-bg-background tw-p-1',
			this.userClass(),
		),
	);
}
