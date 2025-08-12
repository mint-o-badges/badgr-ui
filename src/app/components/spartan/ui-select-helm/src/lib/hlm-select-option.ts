import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { BrnSelectOption } from '@spartan-ng/brain/select';
import { HlmIcon } from '@spartan-ng/helm/icon';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-option',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [{ directive: BrnSelectOption, inputs: ['disabled', 'value'] }],
	providers: [provideIcons({ lucideCheck })],
	host: {
		'[class]': '_computedClass()',
	},
	template: `
		<span class="tw-absolute tw-right-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center">
			@if (this._brnSelectOption.selected()) {
				<ng-icon hlm size="sm" aria-hidden="true" name="lucideCheck" />
			}
		</span>

		<ng-content />
	`,
	imports: [NgIcon, HlmIcon],
})
export class HlmSelectOption {
	protected readonly _brnSelectOption = inject(BrnSelectOption, { host: true });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'data-[active]:tw-bg-accent data-[active]:tw-text-accent-foreground [&>ng-icon]:tw-text-muted-foreground tw-outline-hidden [&>ng-icon]:tw-pointer-events-none [&>ng-icon]:tw-shrink-0 [&>ng-icon]:tw-size-4 *:[span]:last:tw-flex *:[span]:last:tw-items-center *:[span]:last:tw-gap-2',
			'tw-relative tw-flex tw-w-full tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2 rtl:tw-flex-reverse rtl:tw-pr-8 rtl:tw-pl-2 tw-text-sm tw-outline-none data-[active]:tw-bg-accent data-[active]:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50',
			this.userClass(),
		),
	);
}
