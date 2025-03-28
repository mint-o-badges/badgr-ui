import { Directive, Input, computed, input, signal } from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputVariants = cva(
	'tw-flex tw-box-border tw-rounded-[10px] tw-border tw-font-normal tw-bg-input tw-text-sm  file:tw-border-0 file:tw-text-foreground file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-purple focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
	{
		variants: {
			size: {
				default: 'tw-h-10 tw-py-2 tw-px-4',
				sm: 'tw-h-9 tw-px-3',
				lg: 'tw-h-11 tw-px-8',
			},
			error: {
				auto: '[&.ng-invalid.ng-touched]:tw-text-destructive [&.ng-invalid.ng-touched]:tw-border-destructive [&.ng-invalid.ng-touched]:focus-visible:tw-ring-destructive',
				true: 'tw-text-destructive tw-border-destructive focus-visible:tw-ring-destructive',
			},
		},
		defaultVariants: {
			size: 'default',
			error: 'auto',
		},
	},
);
type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
	selector: '[hlmInput]',
	standalone: true,
	host: {
		'[class]': '_computedClass()',
	},
})
export class HlmInputDirective {
	private readonly _size = signal<InputVariants['size']>('default');
	@Input()
	set size(value: InputVariants['size']) {
		this._size.set(value);
	}

	private readonly _error = signal<InputVariants['error']>('auto');
	@Input()
	set error(value: InputVariants['error']) {
		this._error.set(value);
	}

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(inputVariants({ size: this._size(), error: this._error() }), this.userClass()),
	);
}
