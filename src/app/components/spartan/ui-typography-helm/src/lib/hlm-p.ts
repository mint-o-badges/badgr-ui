import { Directive, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const pVariants = cva('', {
	variants: {
		variant: {
			default: 'tw-text-oebblack',
			light: 'tw-text-[#6B6B6B]',
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
});

export type PVariants = VariantProps<typeof pVariants>;

@Directive({
	selector: '[hlmP]',
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmP {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly _variant = input<PVariants['variant']>('default');
	public readonly _size = input<PVariants['size']>('default');
	protected _computedClass = computed(() => hlm(pVariants({ variant: this._variant(), size: this._size() }),, this.userClass()));
}
