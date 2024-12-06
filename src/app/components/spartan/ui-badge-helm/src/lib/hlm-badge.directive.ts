import { Directive, Input, booleanAttribute, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const badgeVariants = cva(
	'tw-inline-flex tw-items-center tw-border tw-rounded-full  tw-font-semibold tw-transition-colors tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-ring tw-focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'tw-bg-primary tw-border-transparent tw-text-primary-foreground',
				secondary: 'tw-bg-secondary tw-border-transparent tw-text-secondary-foreground',
				destructive: 'tw-bg-destructive tw-border-transparent tw-text-destructive-foreground',
				outline: 'tw-text-foreground tw-border-border',
				categoryTag:
					'tw-border-[#6B6B6B] tw-text-[#6B6B6B] tw-border-solid tw-border-1 tw-rounded-full tw-p-2 tw-text-xs',
			},
			size: {
				default: 'tw-text-xs',
				lg: 'tw-text-sm',
			},
			static: { true: '', false: '' },
		},
		compoundVariants: [
			{
				variant: 'default',
				static: false,
				class: 'tw-hover:bg-primary/80',
			},
			{
				variant: 'secondary',
				static: false,
				class: 'tw-hover:bg-secondary/80',
			},
			{
				variant: 'destructive',
				static: false,
				class: 'tw-hover:bg-destructive/80',
			},
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
			static: false,
		},
	},
);

type badgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
	selector: '[hlmBadge]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmBadgeDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(badgeVariants({ variant: this._variant(), size: this._size(), static: this._static() }), this.userClass()),
	);

	private readonly _variant = signal<badgeVariants['variant']>('default');
	@Input()
	set variant(variant: badgeVariants['variant']) {
		this._variant.set(variant);
	}

	private readonly _static = signal<badgeVariants['static']>(false);
	@Input({ transform: booleanAttribute })
	set static(value: badgeVariants['static']) {
		this._static.set(value);
	}

	private readonly _size = signal<badgeVariants['size']>('default');
	@Input()
	set size(size: badgeVariants['size']) {
		this._size.set(size);
	}
}
