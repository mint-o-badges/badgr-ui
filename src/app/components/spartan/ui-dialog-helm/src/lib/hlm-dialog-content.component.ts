import { NgComponentOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation,
	computed,
	inject,
	input,
	signal,
} from '@angular/core';
import { lucideX } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
import { BrnDialogCloseDirective, BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
// import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { HlmIconComponent, provideIcons } from '../../../../spartan/ui-icon-helm/src';
import type { ClassValue } from 'clsx';
import { HlmDialogCloseDirective } from './hlm-dialog-close.directive';
import { VariantProps, cva } from 'class-variance-authority';

export const dialogVariants = cva(
	'tw-border-border tw-grid tw-w-full tw-max-w-lg tw-relative tw-gap-4 tw-border tw-shadow-lg tw-duration-200 data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[state=closed]:tw-slide-out-to-top-[2%]  data-[state=open]:tw-slide-in-from-top-[2%] sm:tw-rounded-lg md:tw-w-full',
	{
		variants: {
			variant: {
				default: 'tw-bg-white',
				success: 'tw-bg-green',
				danger: 'tw-bg-white tw-border-solid !tw-rounded-[20px] tw-border-[6px] !tw-border-[var(--color-red)]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);
export type DiealogVariants = VariantProps<typeof dialogVariants>;

@Component({
	selector: 'hlm-dialog-content',
	imports: [NgComponentOutlet, BrnDialogCloseDirective, HlmDialogCloseDirective, HlmIconComponent],
	providers: [provideIcons({ lucideX })],
	host: {
		'[class]': '_computedClass()',
		'[attr.data-state]': 'state()',
	},
	template: `
		@if (component) {
			<ng-container [ngComponentOutlet]="component" />
		} @else {
			<ng-content />
		}

		<button brnDialogClose hlm>
			<span class="tw-sr-only">Close</span>
			<hlm-icon class="tw-flex tw-w-4 tw-h-4" size="none" name="lucideX" />
		</button>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class HlmDialogContentComponent {
	private readonly _dialogRef = inject(BrnDialogRef);
	private readonly _dialogContext = injectBrnDialogContext({ optional: true });

	public readonly state = computed(() => this._dialogRef?.state() ?? 'closed');

	public readonly component = this._dialogContext?.$component;
	private readonly _dynamicComponentClass = this._dialogContext?.$dynamicComponentClass;

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(dialogVariants({ variant: this._dialogContext.variant }), this.userClass(), this._dynamicComponentClass),
	);
}
