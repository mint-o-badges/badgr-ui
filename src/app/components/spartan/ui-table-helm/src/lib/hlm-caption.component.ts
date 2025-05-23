import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation,
	booleanAttribute,
	computed,
	effect,
	inject,
	input,
} from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';
import { HlmTableComponent } from '../index';

let captionIdSequence = 0;

@Component({
	selector: 'hlm-caption',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
		'[id]': 'id()',
	},
	template: ` <ng-content /> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class HlmCaptionComponent {
	private readonly _table = inject(HlmTableComponent, { optional: true });

	protected readonly id = input<string | null | undefined>(`${captionIdSequence++}`);

	public readonly hidden = input(false, { transform: booleanAttribute });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-text-center tw-block tw-mt-4 tw-text-sm tw-text-muted-foreground',
			this.hidden() ? 'tw-sr-only' : 'tw-order-last',
			this.userClass(),
		),
	);

	constructor() {
		effect(
			() => {
				const id = this.id();
				if (!this._table) return;
				this._table.labeledBy.set(id);
			},
			{ allowSignalWrites: true },
		);
	}
}
