import { Directive, Input, computed, inject, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnLabelDirective } from '@spartan-ng/ui-label-brain';
import { cva, type VariantProps } from 'class-variance-authority';
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
	standalone: true,
	hostDirectives: [
		{
			directive: BrnLabelDirective,
			inputs: ['id'],
		},
	],
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmLabelDirective {
	private readonly _brn = inject(BrnLabelDirective, { host: true });

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			labelVariants({
				variant: this._variant(),
				error: this._error(),
				disabled: this._brn?.dataDisabled() ?? 'auto',
			}),
			'[&.ng-invalid.ng-touched]:text-destructive',
			this.userClass(),
		),
	);

	private readonly _variant = signal<LabelVariants['variant']>('default');
	@Input()
	set variant(value: LabelVariants['variant']) {
		this._variant.set(value);
	}

	private readonly _error = signal<LabelVariants['error']>('auto');
	@Input()
	set error(value: LabelVariants['error']) {
		this._error.set(value);
	}
}
