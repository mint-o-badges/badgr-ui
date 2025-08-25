import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { BrnSelect, BrnSelectTrigger } from '@spartan-ng/brain/select';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const selectTriggerVariants = cva(
	'tw-flex tw-items-center tw-justify-between tw-rounded-md tw-border tw-border-input tw-bg-background tw-text-sm tw-ring-offset-background placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
	{
		variants: {
			size: {
				default: 'tw-h-10 tw-py-2 tw-px-4',
				sm: 'tw-h-9 tw-px-3',
				lg: 'tw-h-11 tw-px-8',
				actionBar: 'tw-h-12 tw-py-2 tw-px-4',
			},
			error: {
				auto: '[&.ng-invalid.ng-touched]:tw-text-destructive [&.ng-invalid.ng-touched]:tw-border-destructive [&.ng-invalid.ng-touched]:tw-focus-visible:tw-ring-destructive',
				true: 'tw-text-destructive tw-border-destructive focus-visible:tw-ring-destructive',
			},
		},
		defaultVariants: {
			size: 'default',
			error: 'auto',
		},
	},
);
type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;

@Component({
	selector: 'hlm-select-trigger',
	imports: [BrnSelectTrigger, NgIcon, HlmIcon],
	providers: [provideIcons({ lucideChevronDown })],
	template: `
		<button [class]="_computedClass()" #button hlmInput brnSelectTrigger type="button" [attr.data-size]="size()">
			<ng-content />
			@if (_icon()) {
				<ng-content select="ng-icon" />
			} @else {
				<ng-icon hlm size="sm" class="tw-ml-2 tw-flex-none" name="lucideChevronDown" />
			}
		</button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmSelectTrigger {
	protected readonly _icon = contentChild(HlmIcon);

	protected readonly _brnSelect = inject(BrnSelect, { optional: true });

	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	public readonly size = input<SelectTriggerVariants['size']>('default');

	protected readonly _computedClass = computed(() =>
		hlm(selectTriggerVariants({ size: this.size(), error: this._brnSelect?.errorState() }), this.userClass()),
	);
}
