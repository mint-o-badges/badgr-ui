import { Directive, type DoCheck, Injector, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { hlm } from '@spartan-ng/brain/core';
import { BrnFormFieldControl } from '@spartan-ng/brain/form-field';
import { ErrorStateMatcher, ErrorStateTracker } from '@spartan-ng/brain/forms';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputVariants = cva(
	'tw-flex tw-rounded-md tw-border tw-font-normal tw-border-input tw-bg-transparent tw-text-base md:tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-text-foreground file:tw-bg-transparent file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
	{
		variants: {
			size: {
				default: 'tw-h-10 tw-py-2 tw-px-4 file:max-md:tw-py-0',
				sm: 'tw-h-9 tw-px-3 file:md:tw-py-2 file:max-md:tw-py-1.5',
				lg: 'tw-h-11 tw-px-8 file:tw-md:py-3 file:max-md:tw-py-2.5',
			},
			error: {
				auto: '[&.ng-invalid.ng-touched]:tw-text-destructive [&.ng-invalid.ng-touched]:tw-border-destructive [&.ng-invalid.ng-touched]:focus-visible:tw-ring-destructive',
				true: 'tw-text-destructive tw-border-destructive tw-focus-visible:tw-ring-destructive',
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
	providers: [
		{
			provide: BrnFormFieldControl,
			useExisting: HlmInputDirective,
		},
	],
})
export class HlmInputDirective implements BrnFormFieldControl, DoCheck {
	public readonly size = input<InputVariants['size']>('default');

	public readonly error = input<InputVariants['error']>('auto');

	protected readonly state = computed(() => ({
		error: signal(this.error()),
	}));

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(inputVariants({ size: this.size(), error: this.state().error() }), this.userClass()),
	);

	private readonly _injector = inject(Injector);

	public readonly ngControl: NgControl | null = this._injector.get(NgControl, null);

	private readonly _errorStateTracker: ErrorStateTracker;

	private readonly _defaultErrorStateMatcher = inject(ErrorStateMatcher);
	private readonly _parentForm = inject(NgForm, { optional: true });
	private readonly _parentFormGroup = inject(FormGroupDirective, { optional: true });

	public readonly errorState = computed(() => this._errorStateTracker.errorState());

	constructor() {
		this._errorStateTracker = new ErrorStateTracker(
			this._defaultErrorStateMatcher,
			this.ngControl,
			this._parentFormGroup,
			this._parentForm,
		);

		effect(() => {
			const error = this._errorStateTracker.errorState();
			untracked(() => {
				if (this.ngControl) {
					this.setError(error);
				}
			});
		});
	}

	ngDoCheck() {
		this._errorStateTracker.updateErrorState();
	}

	setError(error: InputVariants['error']) {
		this.state().error.set(error);
	}
}