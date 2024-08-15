import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { HlmInputDirective } from './spartan/ui-input-helm/src';
import { OebInputErrorComponent } from './input.error.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UrlValidator } from '../common/validators/url.validator';
import { TextSemibold } from './typography/text-semibold';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';

@Component({
	selector: 'oeb-input',
	standalone: true,
	imports: [HlmInputDirective, HlmPDirective, OebInputErrorComponent, NgIf, NgClass, ReactiveFormsModule, TextSemibold],
	template: ` <div [ngClass]="{ 'tw-mt-6 md:tw-mt-7': !noTopMargin }">
		<div class="tw-flex tw-justify-between">
			<label class="tw-pb-[2px] tw-pl-[3px]" [attr.for]="inputName" *ngIf="label">
				<span hlmP class="tw-text-oebblack tw-font-semibold" [innerHTML]="label"></span
				><span *ngIf="optional">(OPTIONAL)</span>
				<span *ngIf="formFieldAside">{{ formFieldAside }}</span>
			</label>
			<ng-content
				class="tw-relative tw-z-20 tw-font-semibold tw-text-[14px] md:tw-text-[20px] tw-leading-4 md:tw-leading-6"
				select="[label-additions]"
			></ng-content>
		</div>
		<p class="tw-pl-[3px]" *ngIf="sublabel">
			{{ sublabel }}
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
			[readonly]="readonly || false"
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
			#textInput
			class="tw-w-full tw-border-solid tw-border-purple tw-bg-white tw-min-h-[80px]"
			hlmInput
		></textarea>
		<oeb-input-error
			class="tw-text-red tw-pl-[3px]"
			*ngIf="isErrorState"
			[error]="errorMessageForDisplay"
		></oeb-input-error>
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
	@Input() readonly?: boolean = false;
	@Input() sublabel?: string;
	@Input() autofocus = false;
	@Input() noTopMargin = false;

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

	ngAfterViewInit() {
		if (this.autofocus) {
			this.focus();
		}
	}

	cacheControlState() {
		this.cachedErrorMessage = this.uncachedErrorMessage;
		this.cachedDirtyState = this.control.dirty;
		this.cachedErrorState = this.controlErrorState;
	}

	focus() {
		this.inputElement.focus();
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
	required: (label: string) => `Bitte ${label} eingeben`,
	validUrl: () => `Bitte gültige URL eingeben.`,
	invalidTelephone: () => `Bitte gültige Telefonnummer eingeben`,
	invalidEmail: () => `Bitte gültige E-Mail Adresse eingeben`,
	maxlength: (label: string, { actualLength, requiredLength }: { actualLength: number; requiredLength: number }) =>
		actualLength && requiredLength
			? `${label} überschreitet maximale Länge von ${requiredLength} um ${actualLength - requiredLength} Zeichen`
			: `${label} überschreitet maximale Länge.`,
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
