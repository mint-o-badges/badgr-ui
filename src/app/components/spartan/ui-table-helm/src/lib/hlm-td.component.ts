import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation,
	booleanAttribute,
	computed,
	inject,
	input,
} from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnColumnDefComponent } from '@spartan-ng/ui-table-brain';
import type { ClassValue } from 'clsx';

@Component({
    selector: 'hlm-td',
    imports: [NgTemplateOutlet],
    host: {
        '[class]': '_computedClass()',
    },
    template: `
		<ng-template #content>
			<ng-content />
		</ng-template>
		@if (truncate()) {
			<span class="tw-flex-1 tw-truncate">
				<ng-container [ngTemplateOutlet]="content" />
			</span>
		} @else {
			<ng-container [ngTemplateOutlet]="content" />
		}
	`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class HlmTdComponent {
	private readonly _columnDef? = inject(BrnColumnDefComponent, { optional: true });
	public readonly truncate = input(false, { transform: booleanAttribute });

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm('tw-flex tw-flex-none tw-p-4 tw-items-center [&:has([role=checkbox])]:tw-pr-0', this._columnDef?.class(), this.userClass()),
	);
}
