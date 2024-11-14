import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { OebInputErrorComponent } from './input.error.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { BrnSelectImports } from '@spartan-ng/ui-select-brain';
import { HlmSelectModule } from './spartan/ui-select-helm/src/index';
import { CustomValidatorMessages, messagesForValidationError } from './input.component';

@Component({
	selector: 'oeb-select ',
	standalone: true,
	imports: [
		BrnSelectImports,
		HlmSelectModule,
		HlmPDirective,
		OebInputErrorComponent,
		NgFor,
		NgIf,
		ReactiveFormsModule,
		NgClass,
	],
	template: ` <div [ngClass]="{ 'tw-mt-6 md:tw-mt-7': !noTopMargin }">
		<label class="tw-pb-[2px] tw-pl-[3px]" [attr.for]="inputName" *ngIf="label">
			<span hlmP class="tw-text-oebblack tw-font-semibold" [innerHTML]="label"></span>
			<span *ngIf="formFieldAside">{{ formFieldAside }}</span>
			<ng-content select="[label-additions]"></ng-content>
		</label>

		<label class="visuallyhidden" [attr.for]="inputName" *ngIf="ariaLabel">{{ ariaLabel }}</label>

		<div class="" *ngIf="description">{{ description }}</div>

		<brn-select
			[formControl]="control"
			(focus)="cacheControlState()"
			(keypress)="handleKeyPress($event)"
			#selectInput
			class="tw-text-oebblack"
			[ngClass]="{ 'tw-pointer-events-none tw-opacity-50': disabled}"
			[attr.id]="id"
			brn-select
			hlm
		>
			<hlm-select-trigger class="tw-w-full tw-border-solid tw-border-purple tw-bg-white">
				<hlm-select-value class="tw-text-base" />
			</hlm-select-trigger>
			<hlm-select-content>
				<hlm-option *ngIf="placeholder" selected value="">{{ placeholder }}</hlm-option>
				<hlm-option *ngFor="let option of options" [value]="option.value">{{ option.label }}</hlm-option>
			</hlm-select-content>
		</brn-select>

		<oeb-input-error
			class="tw-text-red tw-pl-[3px]"
			*ngIf="isErrorState"
			[error]="errorMessageForDisplay"
		></oeb-input-error>
	</div>`,
})
export class OebSelectComponent {
	@Input() control: FormControl;
	@Input() initialValue: string;
	@Input() label: string;
	@Input() ariaLabel: string | null = null;
	@Input() includeLabelAsWrapper = false; // includes label for layout purposes even if label text wasn't passed in.
	@Input() formFieldAside: string; // Displays additional text above the field. I.E (optional)
	@Input() errorMessage: CustomValidatorMessages;
	@Input() multiline = false;
	@Input() description: string;
	@Input() placeholder: string;
	@Input() disabled: boolean = false;
	@Input() id: string = null;

	@Input() options: FormFieldSelectOption[];
	@Input() set optionMap(valueToLabelMap: { [value: string]: string }) {
		this.options = Object.getOwnPropertyNames(valueToLabelMap).map((value) => ({
			value,
			label: valueToLabelMap[value],
		}));
	}

	@Input() errorGroup: FormGroup;
	@Input() errorGroupMessage: CustomValidatorMessages;

	@Input() unlockConfirmText =
		'Unlocking this field may have unintended consequences. Are you sure you want to continue?';
	@Input() urlField = false;

	@Input() autofocus = false;
	@Input() noTopMargin = false;

	@ViewChild('selectInput') selectInput: ElementRef;

	private _unlocked = false;
	@Input()
	set unlocked(unlocked: boolean) {
		this._unlocked = unlocked;
		this.updateDisabled();
	}

	get unlocked() {
		return this._unlocked;
	}

	private _locked = false;
	@Input()
	set locked(locked: boolean) {
		this._locked = locked;
		this.updateDisabled();
	}

	get locked() {
		return this._locked;
	}

	get inputElement(): HTMLInputElement | HTMLTextAreaElement {
		if (this.selectInput && this.selectInput.nativeElement) {
			return this.selectInput.nativeElement;
		}
		return null;
	}

	get hasFocus(): boolean {
		return document.activeElement === this.inputElement;
	}

	get errorMessageForDisplay(): string {
		return this.hasFocus ? this.cachedErrorMessage : this.uncachedErrorMessage;
	}

	get uncachedErrorMessage(): string {
		return messagesForValidationError(this.label, this.control && this.control.errors, this.errorMessage).concat(
			messagesForValidationError(this.label, this.errorGroup && this.errorGroup.errors, this.errorGroupMessage),
		)[0]; // Only display the first error
	}

	get value() {
		return this.control.value;
	}

	private cachedErrorMessage = null;
	private cachedErrorState = null;
	private cachedDirtyState = null;

	get controlErrorState() {
		return this.control.dirty && (!this.control.valid || (this.errorGroup && !this.errorGroup.valid));
	}

	get isErrorState() {
		if (this.hasFocus && this.cachedErrorState !== null) {
			return this.cachedErrorState;
		} else {
			return this.controlErrorState;
		}
	}

	get isLockedState() {
		return this.locked && !this.unlocked;
	}

	private randomName = 'field' + Math.random();

	get inputName() {
		return (this.label || this.placeholder || this.randomName).replace(/[^\w]+/g, '_').toLowerCase();
	}

	ngAfterViewInit() {
		if (this.autofocus) {
			this.focus();
		}
	}

	updateDisabled() {
		if (!this.control) {
			return;
		}

		if (this.isLockedState) {
			this.control.disable();
		} else {
			this.control.enable();
		}
	}

	cacheControlState() {
		this.cachedErrorMessage = this.uncachedErrorMessage;
		this.cachedDirtyState = this.control.dirty;
		this.cachedErrorState = this.controlErrorState;
	}

	focus() {
		if (this.inputElement) {
			this.inputElement.focus();
		}
	}

	select() {
		this.inputElement.select();
	}

	handleKeyPress(event: KeyboardEvent) {
		// This handles revalidating when hitting enter from within an input element. Ideally, we'd catch _all_ form submission
		// events, but since the form supresses those if things aren't valid, that doesn't really work. So we do this hack.
		if (event.keyCode === 13) {
			this.control.markAsDirty();
			this.cacheControlState();
		}
	}
}

export interface FormFieldSelectOption {
	label: string;
	value: string;
	description?: string;
}
