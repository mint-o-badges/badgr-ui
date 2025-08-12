import { Directive, Input, booleanAttribute, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { BrnMenuItem } from '@spartan-ng/brain/menu';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const hlmMenuItemVariants = cva(
	'tw-group tw-w-full tw-relative tw-flex tw-cursor-default tw-select-none tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-none tw-transition-colors hover:tw-bg-accent hover:tw-text-accent-foreground focus-visible:tw-bg-accent focus-visible:tw-text-accent-foreground disabled:tw-pointer-events-none disabled:tw-opacity-50',
	{
		variants: {
			inset: {
				true: 'tw-pl-8',
				false: '',
			},
			size: {
				default: 'tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px] tw-px-6 tw-py-3',
				sm: 'tw-text-[14px] tw-leading-[15.6px] md:tw-text-[14px] md:tw-leading-[15.6px] tw-px-4 tw-py-[7px] ',
				lg: 'tw-text-[20px] tw-leading-[28px] md:tw-text-[24px] md:tw-leading-[33.6px]',
			},
		},
		defaultVariants: { inset: false, size: 'default' },
	},
);
export type HlmMenuItemVariants = VariantProps<typeof hlmMenuItemVariants>;

@Directive({
	selector: '[hlmMenuItem]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
	hostDirectives: [
		{
			directive: BrnMenuItem,
			inputs: ['disabled: disabled'],
			outputs: ['triggered: triggered'],
		},
	],
})
export class HlmMenuItem {
	private readonly _inset = signal<boolean>(false);
	protected readonly _size = signal<HlmMenuItemVariants['size']>('default');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(hlmMenuItemVariants({ inset: this._inset(), size: this._size() }), this.userClass()),
	);

	@Input({ transform: booleanAttribute })
	public set inset(value: boolean) {
		this._inset.set(value);
	}

	@Input()
	public set size(value: HlmMenuItemVariants['size']) {
		this._size.set(value);
	}
}
