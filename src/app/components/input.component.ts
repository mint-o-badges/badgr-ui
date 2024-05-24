import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { HlmInputDirective } from './spartan/ui-input-helm/src';
import { OebInputErrorComponent } from './input.error.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { UrlValidator } from '../common/validators/url.validator';
import { TextSemibold } from './typography/text-semibold';

@Component({
  selector: 'oeb-input',
  standalone: true,
  imports: [HlmInputDirective, OebInputErrorComponent, NgIf, ReactiveFormsModule, TextSemibold],
  template: `
  <div class="tw-mt-4 md:tw-mt-6">
    <div class="tw-flex tw-justify-between">
        <label class="tw-pb-[2px] tw-pl-[3px]" [attr.for]="inputName" *ngIf="label">
            <oeb-text-semibold class="tw-text-oebblack" [text]="label"></oeb-text-semibold><span *ngIf="optional">(OPTIONAL)</span>
            <span *ngIf="formFieldAside">{{ formFieldAside }}</span>
        </label>
        <ng-content class="tw-relative tw-z-20 tw-font-semibold tw-text-[14px] md:tw-text-[20px] tw-leading-4 md:tw-leading-6" select="[label-additions]"></ng-content>
    </div>
    <p class="" *ngIf="sublabel">
        <span *ngIf="remainingCharactersNum >= 0">{{ remainingCharactersNum }}</span
        >{{ sublabel }}
    </p>
    <label class="visuallyhidden" [attr.for]="inputName" *ngIf="ariaLabel">{{ ariaLabel }}</label>

    <input 		
		*ngIf="fieldType != 'textarea'"
        (focus)="cacheControlState()"
        (keypress)="handleKeyPress($event)"
        (keyup)="handleKeyUp($event)"
        (change)="postProcessInput()"
        [formControl]="control"
        [placeholder]="placeholder || ''"
        [attr.maxlength]="maxchar"
        [attr.max]="max"
        [type]="fieldType"
        #textInput 
        class="tw-w-full tw-border-solid tw-border-purple tw-bg-white"
        hlmInput 
         />
	 <textarea
		*ngIf="fieldType === 'textarea'"
		 (focus)="cacheControlState()"
		 (keypress)="handleKeyPress($event)"
		 (keyup)="handleKeyUp($event)"
		 (change)="postProcessInput()"
		 [formControl]="control"
		 [placeholder]="placeholder || ''"
		 [attr.maxlength]="maxchar"
		 [attr.max]="max"
		 [type]="fieldType"
		 #textInput 
		 class="tw-w-full tw-border-solid tw-border-purple tw-bg-white tw-min-h-[80px]"
		 hlmInput 
		></textarea>
    <oeb-input-error class="tw-text-red" *ngIf="isErrorState" [error]="errorMessageForDisplay"></oeb-input-error>
  </div>`,
})
export class OebInputComponent {

    @Input() error: string;
	@Input() errorOverride?: false;
	@Input() label: string;
	@Input() ariaLabel: string;
	@Input() errorMessage: string;
	@Input() errorGroupMessage: CustomValidatorMessages;
	@Input() urlField = false;
	@Input() fieldType = 'text';
	@Input() placeholder = '';
	@Input() maxchar?: number = null;
	@Input() max?: number;
    @Input() sublabel?: string;


	@ViewChild('textInput') textInput: ElementRef;
	@ViewChild('textareaInput') textareaInput: ElementRef;

	private cachedErrorMessage = null;
	private cachedErrorState = null;
	private cachedDirtyState = null;
	@Input() control: FormControl;
	@Input() errorGroup: FormGroup;

	remainingCharactersNum = this.maxchar;

    get hasFocus(): boolean {
		return document.activeElement === this.inputElement;
	}
    get isErrorState() {
		if (this.hasFocus && this.cachedErrorState !== null) {
			return this.cachedErrorState;
		} else {
			return this.controlErrorState;
		}
	}

    get inputElement(): HTMLInputElement | HTMLTextAreaElement {
		if (this.textInput && this.textInput.nativeElement) {
			return this.textInput.nativeElement;
		}
		if (this.textareaInput && this.textareaInput.nativeElement) {
			return this.textareaInput.nativeElement;
		}
		return null;
	}


    get controlErrorState() {
		return (
			this.errorOverride ||
			(this.control.dirty && (!this.control.valid || (this.errorGroup && !this.errorGroup.valid)))
		);
	}
	get errorMessageForDisplay(): string {
		return this.hasFocus ? this.cachedErrorMessage : this.uncachedErrorMessage;
	}

    get uncachedErrorMessage(): string {
		return messagesForValidationError(
			this.label || this.ariaLabel,
			this.control && this.control.errors,
			this.errorMessage,
		).concat(
			messagesForValidationError(this.label, this.errorGroup && this.errorGroup.errors, this.errorGroupMessage),
		)[0]; // Only display the first error
	}

    cacheControlState() {
		this.cachedErrorMessage = this.uncachedErrorMessage;
		this.cachedDirtyState = this.control.dirty;
		this.cachedErrorState = this.controlErrorState;
	}

    handleKeyPress(event: KeyboardEvent) {
		// This handles revalidating when hitting enter from within an input element. Ideally, we'd catch _all_ form submission
		// events, but since the form supresses those if things aren't valid, that doesn't really work. So we do this hack.
		if (event.code === 'Enter') {
			this.control.markAsDirty();
			this.cacheControlState();
		}
	}

    handleKeyUp(event: KeyboardEvent) {
		this.remainingCharactersNum = this.maxchar - (this.control.value ? this.control.value.length : 0);
	}

    public postProcessInput() {
		if (this.urlField) {
			UrlValidator.addMissingHttpToControl(this.control);
		}
	}


}

export type CustomValidatorMessages = string | { [validatorKey: string]: string };


export const defaultValidatorMessages: {
	[validatorKey: string]: (label: string, result?: unknown) => string;
} = {
	required: (label: string) => `${label} is required`,
	validUrl: () => `Bitte gültige URL eingeben.`,
	invalidTelephone: () => `Please enter a valid phone number`,
	invalidEmail: () => `Bitte gültige E-Mail Adresse eingeben`,
	maxlength: (label: string, { actualLength, requiredLength }: { actualLength: number; requiredLength: number }) =>
		actualLength && requiredLength
			? `${label} exceeds maximum length of ${requiredLength} by ${actualLength - requiredLength} characters`
			: `${label} exceeds maximum length.`,
};


export function messagesForValidationError(
	label: string,
	validatorResult: { [key: string]: string },
	customMessages: CustomValidatorMessages,
): string[] {
	if (validatorResult && typeof validatorResult === 'object' && Object.keys(validatorResult).length > 0) {
		if (typeof customMessages === 'string') {
			return [customMessages];
		}

		const messages: string[] = [];

		Object.keys(validatorResult).forEach((validatorKey) => {
			const validatorValue = validatorResult[validatorKey];

			messages.push(
				(customMessages && typeof customMessages === 'object' && customMessages[validatorKey]) ||
					(validatorValue && typeof validatorValue === 'string' && validatorValue) ||
					(defaultValidatorMessages[validatorKey] &&
						defaultValidatorMessages[validatorKey](label, validatorValue)) ||
					`Field failed ${validatorKey} validation.`,
			);
		});

		return messages;
	} else {
		return [];
	}
}
