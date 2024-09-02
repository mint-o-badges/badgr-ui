import { Component, EventEmitter, forwardRef, computed, input, Input, Output } from '@angular/core';
import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ClassValue } from 'clsx';
import { hlm } from '@spartan-ng/ui-core';
import { CustomValidatorMessages, messagesForValidationError } from './input.component';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OebInputErrorComponent } from './input.error.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'oeb-checkbox',
	standalone: true,
	imports: [HlmPDirective, HlmCheckboxComponent, NgIf, OebInputErrorComponent, ReactiveFormsModule],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OebCheckboxComponent),
			multi: true,
		},
	],
	template: ` <label class="tw-flex" hlmP>
			<hlm-checkbox [name]="name" [checked]="checked" (changed)="onChange($event)" [formControl]="control" class="tw-mr-2 tw-mt-[0.25rem]" />
			<div class="tw-flex tw-flex-col">
				<span class="tw-pl-[3px]" [innerHTML]="text"></span>
				<oeb-input-error
				class="tw-text-red tw-pl-[3px]"
				*ngIf="isErrorState"
				[error]="errorMessageForDisplay"
			></oeb-input-error>

			</div>
		</label>`,
	host: {
		'[class]': '_computedClass()',
	},
})
export class OebCheckboxComponent implements ControlValueAccessor {
	@Input() text: string;
	@Input() control: FormControl;
	@Input() name: string;
	@Output() checkedChange = new EventEmitter<boolean>();
	@Input() ngModel: boolean;
	@Input() value: string;
	@Input() checked = false;
	@Input() error: string;
	@Input() errorMessage: CustomValidatorMessages;
	@Input() label: string;
	@Input() errorGroup: FormGroup;
	@Input() errorGroupMessage: CustomValidatorMessages;

	@Output() ngModelChange = new EventEmitter<string>();


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
		const checkboxDefaultErrorText = { required: "Dieses Feld ist erforderlich" };
		
		return messagesForValidationError(this.label, checkboxDefaultErrorText, this.errorMessage).concat(
			messagesForValidationError(this.label, this.errorGroup && this.errorGroup.errors, this.errorGroupMessage),
		)[0]; // Only display the first error
	}

	private cachedErrorState = null;

	get controlErrorState() {
		if(this.control){
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
