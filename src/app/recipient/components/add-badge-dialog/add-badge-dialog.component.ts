import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {RecipientBadgeManager} from '../../services/recipient-badge-manager.service';
import {FormBuilder} from '@angular/forms';
import {UrlValidator} from '../../../common/validators/url.validator';
import {JsonValidator} from '../../../common/validators/json.validator';
import {MessageService} from '../../../common/services/message.service';
import {BadgrApiFailure} from '../../../common/services/api-failure';
import {BaseDialog} from '../../../common/dialogs/base-dialog';
import {preloadImageURL} from '../../../common/util/file-util';
import {FormFieldText} from '../../../common/components/formfield-text';
import {TypedFormControl, typedFormGroup} from '../../../common/util/typed-forms';


type AddBadgeDialogTabName = "upload" | "url" | "json";


@Component({
	selector: 'add-badge-dialog',
	templateUrl: './add-badge-dialog.component.html',
})
export class AddBadgeDialogComponent extends BaseDialog {
	static defaultOptions = {} as AddBadgeDialogOptions;
	readonly uploadBadgeImageUrl = require('../../../../breakdown/static/images/image-uplodBadge.svg') as string;
	readonly pasteBadgeImageUrl = preloadImageURL(require('../../../../breakdown/static/images/image-uplodBadgeUrl.svg') as string);

	addRecipientBadgeForm = typedFormGroup()
		.addControl("image", null)
		.addControl("url", "", UrlValidator.validUrl)
		.addControl("assertion", "", JsonValidator.validJson)
	;

	showAdvance = false;
	formError: string;

	currentTab: AddBadgeDialogTabName = "upload";

	options: AddBadgeDialogOptions = AddBadgeDialogComponent.defaultOptions;
	resolveFunc: () => void = () => {};
	rejectFunc: (err?: unknown) => void;

	badgeUploadPromise: Promise<unknown>;

	@ViewChild("jsonField")
	private jsonField: FormFieldText;

	@ViewChild("urlField")
	private urlField: FormFieldText;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		protected recipientBadgeManager: RecipientBadgeManager,
		protected formBuilder: FormBuilder,
		protected messageService: MessageService
	) {
		super(componentElem, renderer);
	}

	isJson = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "true" button, the promise will be
	 * resolved, otherwise, it will be rejected.
	 *
	 * @param customOptions Options for the dialog
	 * @returns {Promise<void>}
	 */
	openDialog(
		customOptions: AddBadgeDialogOptions
	): Promise<void> {
		this.options = Object.assign({}, AddBadgeDialogComponent.defaultOptions, customOptions);
		this.addRecipientBadgeForm.reset();
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc();
	}

	get formHasBadgeValue() {
		const formState = this.addRecipientBadgeForm.value;

		return !!(formState.assertion || formState.image || formState.url);
	}

	submitBadgeRecipientForm() {
		const formState = this.addRecipientBadgeForm.value;

		if (this.formHasBadgeValue && this.addRecipientBadgeForm.valid) {
			this.badgeUploadPromise = this.recipientBadgeManager
				.createRecipientBadge(formState)
				.then(instance => {
					this.messageService.reportMajorSuccess("Badge successfully imported.");
					this.closeDialog();
				})
				.catch(err => {

					let message = BadgrApiFailure.from(err).firstMessage;

					// display human readable description of first error if provided by server
					if (this.isJson(message)) {
						const jsonErr = JSON.parse(message);
						if (err.response && err.response._body) {
							const body = JSON.parse(err.response._body);
							if (body && body.length > 0 && body[0].description) {
								message = body[0].description;
							}
						} else if(jsonErr.length) {
							message = jsonErr[0].result || jsonErr[0].description;
						}
					}

					this.messageService.reportAndThrowError(
						message
							? `Failed to upload badge: ${message}`
							: `Badge upload failed due to an unknown error`,
						err
					);
				})
				.catch(e => {
					this.closeModal();
					this.rejectFunc(e);
				});
		} else {
			this.formError = "At least one badge input is required";
		}
	}

	controlUpdated(updatedControl: TypedFormControl<unknown>) {
		// Clear the value from other controls
		this.addRecipientBadgeForm.controlsArray.forEach(
			control => {
				if (control !== updatedControl) {
					control.reset();
				}
			}
		);
	}

	clearFormError() {
		this.formError = undefined;
	}
}

export interface AddBadgeDialogOptions {}
