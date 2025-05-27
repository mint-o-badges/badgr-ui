import { BooleanInput } from '@angular/cdk/coercion';
import { Component, booleanAttribute, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { hlm } from '@spartan-ng/brain/core';
import { ChangeFn, TouchFn } from '@spartan-ng/brain/forms';
import { BrnSwitchComponent, BrnSwitchThumbComponent } from '@spartan-ng/brain/switch';
import type { ClassValue } from 'clsx';
import { HlmSwitchThumbDirective } from './hlm-switch-thumb.directive';
export const HLM_SWITCH_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => HlmSwitchComponent),
	multi: true,
};

@Component({
	selector: 'hlm-switch',
	imports: [BrnSwitchThumbComponent, BrnSwitchComponent, HlmSwitchThumbDirective],
	host: {
		class: 'contents',
		'[attr.id]': 'null',
		'[attr.aria-label]': 'null',
		'[attr.aria-labelledby]': 'null',
		'[attr.aria-describedby]': 'null',
	},
	template: `
		<brn-switch
			[class]="_computedClass()"
			[checked]="checked()"
			(changed)="handleChange($event)"
			(touched)="_onTouched?.()"
			[disabled]="disabled()"
			[id]="id()"
			[aria-label]="ariaLabel()"
			[aria-labelledby]="ariaLabelledby()"
			[aria-describedby]="ariaDescribedby()"
		>
			<brn-switch-thumb hlm />
		</brn-switch>
	`,
	providers: [HLM_SWITCH_VALUE_ACCESSOR],
})
export class HlmSwitchComponent implements ControlValueAccessor {
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'tw-group tw-inline-flex tw-h-[24px] tw-w-[44px] tw-shrink-0 tw-cursor-pointer tw-items-center tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-background disabled:tw-cursor-not-allowed disabled:tw-opacity-50 data-[state=checked]:tw-bg-primary data-[state=unchecked]:tw-bg-input',
			this.disabled() ? 'tw-cursor-not-allowed tw-opacity-50' : '',
			this.userClass(),
		),
	);

	/** The checked state of the switch. */
	public readonly checked = model<boolean>(false);

	/** The disabled state of the switch. */
	public readonly disabledInput = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
		alias: 'disabled',
	});

	/** Used to set the id on the underlying brn element. */
	public readonly id = input<string | null>(null);

	/** Used to set the aria-label attribute on the underlying brn element. */
	public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

	/** Used to set the aria-labelledby attribute on the underlying brn element. */
	public readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

	/** Used to set the aria-describedby attribute on the underlying brn element. */
	public readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

	/** Emits when the checked state of the switch changes. */
	public readonly changed = output<boolean>();

	private readonly _writableDisabled = computed(() => signal(this.disabledInput()));

	public readonly disabled = computed(() => this._writableDisabled()());

	protected _onChange?: ChangeFn<boolean>;
	protected _onTouched?: TouchFn;

	protected handleChange(value: boolean): void {
		this.checked.set(value);
		this._onChange?.(value);
		this.changed.emit(value);
	}

	/** CONROL VALUE ACCESSOR */

	writeValue(value: boolean): void {
		this.checked.set(Boolean(value));
	}

	registerOnChange(fn: ChangeFn<boolean>): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: TouchFn): void {
		this._onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._writableDisabled().set(isDisabled);
	}
}
