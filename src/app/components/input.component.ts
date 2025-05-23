import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { HlmInputDirective, InputVariants } from './spartan/ui-input-helm/src';
import { OebInputErrorComponent } from './input.error.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UrlValidator } from '../common/validators/url.validator';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';

@Component({
	selector: 'oeb-input',
	imports: [HlmInputDirective, HlmPDirective, OebInputErrorComponent, NgIf, NgClass, ReactiveFormsModule],
	styleUrls: ['./input.component.scss'],
	template: ` <div
		[ngClass]="{ 'tw-my-6 md:tw-mt-7': !noTopMargin, 'tw-opacity-50 tw-pointer-events-none': readonly }"
	>
		<div class="tw-flex tw-justify-between">
			<label class="tw-pb-[2px] tw-pl-[3px]" [attr.for]="inputName" *ngIf="label">
				<span *ngIf="labelStyle; else baseLabel" [class]="labelStyle" [innerHTML]="label"></span>
				<ng-template #baseLabel>
					<span hlmP class="tw-text-oebblack tw-font-semibold" [innerHTML]="label"></span>
				</ng-template>
				<span class="tw-pl-[3px] tw-text-oebblack" *ngIf="sublabelRight"> {{ sublabelRight }}</span>
				<span *ngIf="optional">(OPTIONAL)</span>
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

		<div class="tw-relative tw-w-full">
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
				[readonly]="readonly"
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
				[readonly]="readonly"
				[size]="size"
				#textInput
				class="tw-w-full tw-border-solid tw-border-purple tw-bg-white"
				[ngClass]="{ 'tw-min-h-20': size === 'default', 'tw-min-h-32': size === 'lg' }"
				hlmInput
			></textarea>
			<oeb-input-error
				class="tw-text-red tw-pl-[3px] tw-absolute tw-top-full tw-w-full"
				*ngIf="isErrorState"
				[error]="errorMessageForDisplay"
			></oeb-input-error>
		</div>
	</div>`,
})
export class OebInputComponent {
	@Input() error: string;
	@Input() errorOverride?: false;
	@Input() label: string;
	@Input() labelStyle?: string = '';
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
	@Input() sublabelRight?: string;
	@Input() autofocus = false;
	@Input() noTopMargin = false;
	@Input() size: InputVariants['size'] = 'default';

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
			event.preventDefault();
		}
		// If fieldType is number prevent strings and chars from entering
		if (this.fieldType === 'number') {
			const charCode = event.which ? event.which : event.keyCode;
			const charStr = String.fromCharCode(charCode);
			// Erlaubt nur Zahlen (0-9) und ggf. Dezimalpunkt oder Minuszeichen
			if (!/^\d$/.test(charStr) && charStr !== '.' && charStr !== '-') {
				event.preventDefault(); // Blockiert die Eingabe
			}
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
	maxlength: (
		label: string | undefined,
		{ actualLength, requiredLength }: { actualLength: number; requiredLength: number },
	) =>
		actualLength && requiredLength
			? `${label ?? 'Text'} überschreitet maximale Länge von ${requiredLength} um ${
					actualLength - requiredLength
				} Zeichen`
			: `${label ?? 'Text'} überschreitet maximale Länge.`,
	minlength: (label: string, { actualLength, requiredLength }: { actualLength: number; requiredLength: number }) =>
		actualLength && requiredLength
			? `${label} unterschreitet erforderliche Länge von ${requiredLength} um ${
					requiredLength - actualLength
				} Zeichen`
			: `${label} unterschreitet erforderliche Länge.`,
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
