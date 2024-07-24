import { ChangeDetectionStrategy, Component, Input, computed, inject, input } from '@angular/core';
import { lucideCheck } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from "../../../ui-icon-helm/src";
import { BrnSelectOptionDirective } from '@spartan-ng/ui-select-brain';
import type { ClassValue } from 'clsx';

@Component({
	selector: 'hlm-option',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [BrnSelectOptionDirective],
	providers: [provideIcons({ lucideCheck })],
	host: {
		'[class]': '_computedClass()',
	},
	template: `
		<ng-content />
		<span
			[attr.dir]="_brnSelectOption.dir()"
			class="tw-absolute tw-left-2 tw-flex tw-h-3.5 tw-w-3.5 tw-items-center tw-justify-center rtl:tw-left-auto rtl:tw-right-2"
			[attr.data-state]="this._brnSelectOption.checkedState()"
		>
			@if (this._brnSelectOption.selected()) {
				<hlm-icon aria-hidden="true" name="lucideCheck" />
			}
		</span>
	`,
	imports: [HlmIconComponent],
})
export class HlmSelectOptionComponent {
	protected readonly _brnSelectOption = inject(BrnSelectOptionDirective, { host: true });
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-relative tw-flex tw-w-full tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-py-1.5 tw-pl-8 tw-pr-2  rtl:tw-flex-reverse rtl:tw-pr-8 rtl:tw-pl-2 tw-text-sm tw-outline-none focus:tw-bg-lightpurple focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50',
			this.userClass(),
		),
	);

	@Input()
	set value(value: unknown | null) {
		this._brnSelectOption.value = value;
	}

	@Input()
	public disabled = false;
}
