import { Directive, Input, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

export const hlmP = '';


export const pVariants = cva(
	'',
	{
		variants: {
			variant: {
				default: 'tw-text-oebblack',
				light: 'tw-text-[#6B6B6B]'
				// destructive: 'tw-bg-destructive tw-text-destructive-foreground hover:btw-g-destructive/90',
			},
			size: {
				default: 'tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px]',
				lg: 'tw-text-[20px] tw-leading-[28px] md:tw-text-[24px] md:tw-leading-[33.6px]',
				sm: 'tw-text-[14px] tw-leading-[15.6px] md:tw-text-[14px] md:tw-leading-[15.6px]',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export type PVariants = VariantProps<typeof pVariants>;

@Directive({
	selector: '[hlmP]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmPDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	private readonly _settableClass = signal<ClassValue>('');

	protected _computedClass = computed(() =>
		hlm(pVariants({ variant: this._variant(), size: this._size() }), this._settableClass(), this.userClass()),
	)

	private readonly _variant = signal<PVariants['variant']>('default');
	
	@Input()
	set variant(variant: PVariants['variant']) {
		this._variant.set(variant);
	}

	private readonly _size = signal<PVariants['size']>('default');
	@Input()
	set size(size: PVariants['size']) {
		this._size.set(size);
	}

}
