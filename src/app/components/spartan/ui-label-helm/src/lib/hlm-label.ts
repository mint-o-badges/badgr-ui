import { Directive, computed, inject, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnLabel } from '@spartan-ng/brain/label';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const labelVariants = cva(
	'tw-text-sm tw-font-medium tw-leading-none [&>[hlmInput]]:tw-my-1 [&:has([hlmInput]:disabled)]:tw-cursor-not-allowed [&:has([hlmInput]:disabled)]:tw-opacity-70',
	{
		variants: {
			variant: {
				default: '',
			},
			error: {
				auto: '[&:has([hlmInput].ng-invalid.ng-touched)]:tw-text-destructive',
				true: 'tw-text-destructive',
			},
			disabled: {
				auto: '[&:has([hlmInput]:disabled)]:tw-opacity-70',
				true: 'tw-opacity-70',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			error: 'auto',
		},
	},
);
export type LabelVariants = VariantProps<typeof labelVariants>;

@Directive({
	selector: '[hlmLabel]',
	hostDirectives: [
		{
			directive: BrnLabel,
			inputs: ['id'],
		},
	],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmLabel {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });

	public readonly variant = input<LabelVariants['variant']>('default');

	public readonly error = input<LabelVariants['error']>('auto');

	private readonly _brn = inject(BrnLabel, { host: true });

	protected readonly _computedClass = computed(() =>
		hlm(
			labelVariants({
				variant: this.variant(),
				error: this.error(),
				disabled: this._brn?.dataDisabled() ?? 'auto',
			}),
			'[&.ng-invalid.ng-touched]:text-destructive',
			this.userClass(),
		),
	);
}
