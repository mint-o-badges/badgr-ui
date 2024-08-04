import { Directive, Input, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const buttonVariants = cva(
	'tw-inline-flex tw-items-center tw-justify-center md:tw-rounded-[10px] tw-rounded-[7px] tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-ring-offset-background',
	{
		variants: {
			variant: {
				default:
					'tw-bg-purple tw-text-white hover:tw-bg-buttonhover tw-border-solid tw-border-purple hover:tw-border-buttonhover',
				destructive: 'tw-bg-destructive tw-text-destructive-foreground hover:btw-g-destructive/90',
				red: 'tw-bg-red tw-text-white hover:tw-bg-red-300 tw-border-solid tw-border-red hover:tw-border-red-300',
				secondary:
					'tw-bg-white tw-text-purple hover:tw-bg-buttonhover tw-border-solid tw-border-purple',
				blackborder:
					'tw-bg-white tw-text-oebblack tw-font-medium hover:tw-bg-lightpurple tw-border-solid tw-border-black',
				yellow: 'tw-bg-yellow tw-text-purple hover:tw-bg-yellow hover:tw-text-purple tw-border-solid tw-border-yellow',
				link: 'tw-underline-offset-4 hover:tw-underline tw-text-primary',
			},
			size: {
				default:
					'md:tw-py-[15px] md:tw-px-[60px] md:tw-text-[20px] md:tw-leading-[30px] tw-py-[10.5px] tw-px-[42px] tw-text-[14px] tw-leading-[21px] tw-border-2 tw-font-bold',
				md: 'tw-py-[10px] tw-px-[25px] md:tw-rounded-[10px] tw-rounded-[7px] tw-text-[20px] tw-leading-[28px] tw-border tw-font-bold',
				sm: 'tw-py-[6px] tw-px-[20px] md:tw-rounded-[10px] tw-rounded-[7px] tw-text-[16px] tw-leading-[24px] tw-border tw-font-bold',
				xs: 'tw-py-[4px] tw-px-[16px] md:tw-rounded-[10px] tw-rounded-[7px] tw-border',
				icon: 'tw-h-10 tw-w-10',
			},
			width: {
				default: '',
				max_content: 'tw-w-max',
				full_width: 'tw-w-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			width: 'default',
		},
	},
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
	selector: '[hlmBtn]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmButtonDirective {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	private readonly _settableClass = signal<ClassValue>('');

	protected _computedClass = computed(() =>
		hlm(
			buttonVariants({
				variant: this._variant(),
				size: this._size(),
				width: this._width(),
			}),
			this._settableClass(),
			this.userClass(),
		),
	);

	setClass(value: ClassValue) {
		this._settableClass.set(value);
	}

	private readonly _variant = signal<ButtonVariants['variant']>('default');
	@Input()
	set variant(variant: ButtonVariants['variant']) {
		this._variant.set(variant);
	}

	private readonly _size = signal<ButtonVariants['size']>('default');
	@Input()
	set size(size: ButtonVariants['size']) {
		this._size.set(size);
	}

	private readonly _width = signal<ButtonVariants['width']>('default');
	@Input()
	set width(width: ButtonVariants['width']) {
		this._width.set(width);
	}
}
