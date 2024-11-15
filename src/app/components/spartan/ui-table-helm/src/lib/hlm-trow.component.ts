import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-trow',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
		role: 'row',
	},
	template: ` <ng-content /> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class HlmTrowComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-flex tw-flex tw-border-b tw-border-border tw-transition-colors hover:tw-bg-muted/50 data-[state=selected]:tw-bg-muted',
			this.userClass(),
		),
	);
}
