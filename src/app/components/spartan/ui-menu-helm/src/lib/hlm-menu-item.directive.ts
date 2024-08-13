import { Directive, Input, booleanAttribute, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { BrnMenuItemDirective } from '@spartan-ng/ui-menu-brain';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const hlmMenuItemVariants = cva(
	'tw-group tw-w-full !tw-font-body !tw-text-oebblack tw-relative tw-flex tw-cursor-pointer tw-select-none tw-items-center tw-rounded-sm tw-outline-none tw-transition-colors hover:tw-bg-lightpurple hover:tw-text-accent-foreground focus-visible:tw-bg-accent focus-visible:tw-text-accent-foreground disabled:tw-pointer-events-none disabled:tw-opacity-50',
	{
		variants: { 
			inset: { true: 'pl-8', false: '' },
			size: {
				default: 'tw-text-[14px] tw-leading-[19px] md:tw-text-[20px] md:tw-leading-[28px] tw-px-6 tw-py-3',
				sm: 'tw-text-[14px] tw-leading-[15.6px] md:tw-text-[14px] md:tw-leading-[15.6px] tw-px-4 tw-py-[7px] ',
				lg: 'tw-text-[20px] tw-leading-[28px] md:tw-text-[24px] md:tw-leading-[33.6px]',
			}
		},
		defaultVariants: { inset: false, size: 'default'},
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
			directive: BrnMenuItemDirective,
			inputs: ['disabled: disabled'],
			outputs: ['triggered: triggered'],
		},
	],
})
export class HlmMenuItemDirective {
	private readonly _inset = signal<boolean>(false);
	private readonly _size = signal<HlmMenuItemVariants['size']>('default');

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(hlmMenuItemVariants({ inset: this._inset(), size: this._size() }), this.userClass()));

	@Input({ transform: booleanAttribute })
	set inset(value: boolean) {
		this._inset.set(value);
	}

	@Input()
	set size(value: HlmMenuItemVariants['size']) {
		this._size.set(value);
	}
}
