import {
	Component,
	EventEmitter,
	Input,
	Output,
	booleanAttribute,
	computed,
	forwardRef,
	input,
	signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnCheckboxComponent, indeterminateBooleanAttribute } from '@spartan-ng/brain/checkbox';
import { hlm } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';
import { HlmCheckboxCheckIconComponent } from './hlm-checkbox-checkicon.component';

export const HLM_CHECKBOX_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => HlmCheckboxComponent),
	multi: true,
};

@Component({
	selector: 'hlm-checkbox',
	imports: [BrnCheckboxComponent, HlmCheckboxCheckIconComponent],
	template: `
		<brn-checkbox
			[id]="id()"
			[name]="name()"
			[class]="_computedClass()"
			[checked]="_checked()"
			[disabled]="disabled()"
			[required]="required()"
			[aria-label]="ariaLabel()"
			[aria-labelledby]="ariaLabelledby()"
			[aria-describedby]="ariaDescribedby()"
			(changed)="_handleChange()"
			(touched)="_onTouched()"
		>
			<hlm-checkbox-checkicon [class]="checkIconClass()" [iconName]="checkIconName()" />
		</brn-checkbox>
	`,
	host: {
		class: 'contents',
		'[attr.id]': 'null',
		'[attr.aria-label]': 'null',
		'[attr.aria-labelledby]': 'null',
		'[attr.aria-describedby]': 'null',
	},
	providers: [HLM_CHECKBOX_VALUE_ACCESSOR],
})
export class HlmCheckboxComponent {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() =>
		hlm(
			'tw-group tw-flex tw-border tw-border-purple tw-shrink-0 tw-cursor-pointer tw-items-center tw-rounded-[5px] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring' +
				' focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-background data-[state=checked]:tw-text-background data-[state=checked]:tw-bg-purple data-[state=unchecked]:tw-bg-background data-[state=indeterminate]:tw-bg-white',
			this.userClass(),
			this.disabled() ? 'tw-cursor-not-allowed tw-opacity-50' : '',
		),
	);

	/** Used to set the id on the underlying brn element. */
	public readonly id = input<string | null>(null);

	/** Used to set the aria-label attribute on the underlying brn element. */
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

	/** Used to set the aria-labelledby attribute on the underlying brn element. */
	public readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

	/** Used to set the aria-describedby attribute on the underlying brn element. */
	public readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

	public readonly name = input<string | null>(null);
	public readonly disabled = input(false, { transform: booleanAttribute });
	public readonly required = input(false, { transform: booleanAttribute });

	// icon inputs
	public readonly checkIconName = input<string>('lucideCheck');
	public readonly checkIconClass = input<string>('');

	@Output()
	public changed = new EventEmitter<boolean>();

	protected _handleChange(): void {
		if (this.disabled()) return;

		const previousChecked = this._checked();
		this._checked.set(previousChecked === 'indeterminate' ? true : !previousChecked);
		this._onChange(!previousChecked);
		this.changed.emit(!previousChecked);
	}

	// TODO should be changed to new model input when updated to Angular 17.2
	protected _checked = signal<boolean | 'indeterminate'>(false);
	@Input({ transform: indeterminateBooleanAttribute })
	set checked(value: boolean | 'indeterminate') {
		this._checked.set(value);
	}

	/** CONROL VALUE ACCESSOR */

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	writeValue(value: any): void {
		this.checked = !!value;
	}
	// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars,,@typescript-eslint/no-explicit-any
	protected _onChange = (_: any) => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected _onTouched = () => {};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerOnTouched(fn: any): void {
		this._onTouched = fn;
	}
}
