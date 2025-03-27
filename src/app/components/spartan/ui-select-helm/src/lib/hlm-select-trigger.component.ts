import { NgIcon } from '@ng-icons/core';
import { Component, ContentChild, type ElementRef, ViewChild, computed, input } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/brain/core';
import { HlmIconDirective } from '../../../ui-icon-helm/src';
import { BrnSelectTriggerDirective } from '@spartan-ng/brain/select';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const selectTriggerVariants = cva(
	'tw-flex tw-items-center tw-justify-between tw-rounded-[10px] tw-border tw-border-input tw-bg-background tw-text-sm tw-ring-offset-background placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
	{
		variants: {
			size: {
				default: 'tw-h-10 tw-py-2 tw-px-4',
				sm: 'tw-h-9 tw-px-3',
				lg: 'tw-h-11 tw-px-8',
				actionBar: 'tw-h-12 tw-py-2 tw-px-4',
			},
			error: {
				auto: '[&.ng-invalid.ng-touched]:tw-text-destructive [&.ng-invalid.ng-touched]:tw-border-destructive [&.ng-invalid.ng-touched]:focus-visible:tw-ring-destructive',
				true: 'tw-text-destructive tw-border-destructive focus-visible:tw-text-destructivering-destructive',
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
	imports: [BrnSelectTriggerDirective, NgIcon, HlmIconDirective],
	providers: [provideIcons({ lucideChevronDown })],
	template: `
		<button [class]="_computedClass()" #button hlmInput brnSelectTrigger type="button">
			<ng-content />
			@if (icon) {
			<ng-content select="hlm-icon" />
			} @else {
			<ng-icon hlm class="tw-flex-none tw-w-4 tw-h-4 tw-ml-2 tw-text-purple" name="lucideChevronDown" />
			}
		</button>
	`,
})
export class HlmSelectTriggerComponent {
	@ViewChild('button', { static: true })
	public buttonEl!: ElementRef;

	@ContentChild(HlmIconDirective, { static: false })
	protected icon!: HlmIconDirective;

	public readonly _size = input<SelectTriggerVariants['size']>('default');
	public readonly _error = input<SelectTriggerVariants['error']>('auto');
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	protected _computedClass = computed(() =>
		hlm(selectTriggerVariants({ size: this._size(), error: this._error() }), this.userClass()),
	);
}
