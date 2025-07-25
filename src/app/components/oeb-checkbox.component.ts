import { Component, EventEmitter, forwardRef, computed, input, Input, Output } from '@angular/core';
import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { hlm } from '@spartan-ng/brain/core';
import { CustomValidatorMessages, messagesForValidationError } from './input.component';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OebInputErrorComponent } from './input.error.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'oeb-checkbox',
	imports: [HlmPDirective, HlmCheckboxComponent, NgClass, OebInputErrorComponent, ReactiveFormsModule],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OebCheckboxComponent),
			multi: true,
		},
	],
	template: `<label
		[ngClass]="alignStart ? 'tw-items-start' : 'tw-items-center'"
		class="tw-flex tw-mt-[0.25rem]"
		hlmP
	>
		<hlm-checkbox
			[name]="name"
			[checked]="checked"
			(changed)="onChange($event)"
			[formControl]="control"
			[class.tw-mr-2]="!noMargin"
			[disabled]="disabled"
		/>
		<div class="tw-flex tw-flex-col">
			<span class="tw-pl-[3px]" [innerHTML]="text"></span>
			@if (isErrorState) {
				<oeb-input-error class="tw-text-red tw-pl-[3px]" [error]="errorMessageForDisplay"></oeb-input-error>
			}
		</div>
	</label>`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class OebCheckboxComponent implements ControlValueAccessor {
	@Input() text: string;
	@Input() control: FormControl = new FormControl();
	@Input() name: string;
	@Output() checkedChange = new EventEmitter<boolean>();
	@Input() ngModel: boolean;
	@Input() value: string;
	@Input() checked = false;
	@Input() disabled = false;
	@Input() error: string;
	@Input() errorMessage: CustomValidatorMessages;
	@Input() label: string;
	@Input() errorGroup: FormGroup;
	@Input() errorGroupMessage: CustomValidatorMessages;
	@Input() alignStart = false;
	@Input() noMargin = false;

	@Output() ngModelChange = new EventEmitter<boolean>();

	constructor(private translate: TranslateService) {}

	onChange(event) {
		this.ngModelChange.emit(event);
	}

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(this.userClass()));

	onTouched = () => {};

	writeValue(value: boolean): void {
		this.checked = value;
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {}

	get errorMessageForDisplay(): string {
		return this.uncachedErrorMessage;
	}

	get uncachedErrorMessage(): string {
		const checkboxDefaultErrorText = { required: this.translate.instant('OEBComponents.fieldIsRequired') };

		return messagesForValidationError(this.label, checkboxDefaultErrorText, this.errorMessage).concat(
			messagesForValidationError(this.label, this.errorGroup && this.errorGroup.errors, this.errorGroupMessage),
		)[0]; // Only display the first error
	}

	private cachedErrorState = null;

	get controlErrorState() {
		if (this.control) {
			return this.control.dirty && (!this.control.valid || (this.errorGroup && !this.errorGroup.valid));
		}
	}

	get isErrorState() {
		if (this.cachedErrorState !== null) {
			return this.cachedErrorState;
		} else {
			return this.controlErrorState;
		}
	}
}
