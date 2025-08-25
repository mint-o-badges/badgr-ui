import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-dialog-header',
	template: ` <ng-content /> `,
	host: {
		'[class]': '_computedClass()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmDialogHeader {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-flex tw-flex-col tw-space-y-1.5 tw-text-center sm:tw-text-left', this.userClass()),
	);
}
