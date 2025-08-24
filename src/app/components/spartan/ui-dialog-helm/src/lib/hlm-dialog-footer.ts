import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-dialog-footer',
	template: ` <ng-content /> `,
	host: {
		'[class]': '_computedClass()',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmDialogFooter {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm('tw-flex tw-flex-col-reverse sm:tw-flex-row sm:tw-justify-end sm:tw-space-x-2', this.userClass()),
	);
}
