import { Component, ElementRef, Renderer2 } from '@angular/core';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { ApplicationCredentialsService } from '../../../common/services/application-credentials.service.';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators } from '@angular/forms';

@Component({
	selector: 'add-credentials-dialog',
	template: ` <dialog
		aria-labelledby="addCredentialsDialog"
		aria-describedby="dialog1Desc"
		class="dialog dialog-is-active l-dialog"
		role="dialog"
	>
		<div class="dialog-x-box o-container">
			<div class="dialog-x-header">
				<h2 class="u-text-body-bold-caps text-dark1">{{'Profile.newCredentials' | translate}}</h2>
				<button class="buttonicon buttonicon-link" (click)="closeDialog()">
					<svg icon="icon_close"></svg>
					<span class="visuallyhidden">Close</span>
				</button>
			</div>
			<div class="u-padding-yaxis2x u-margin-xaxis2x border border-top border-light3">
				<form *ngIf="!generatedToken" [formGroup]="credentialsForm.rawControl" #formElem (ngSubmit)="generateCredentials()" novalidate class="l-responsivelist">
					<span class="tw-font-bold tw-text-lg tw-text-black tw-uppercase">{{'Profile.chooseName' | translate}}</span>
					<bg-formfield-text 
						class="tw-py-4"
						[control]="credentialsForm.rawControlMap.client_name"
						[errorMessage]="{
							required: 'Name erforderlich'
						}"
						[autofocus]="true"
					></bg-formfield-text>
					<button [disabled]="!credentialsForm.valid || hasSubmitted" type="submit" class="button oeb-purple">
					{{'Profile.idAndSecret' | translate}}
					</button>
				</form>
				<div *ngIf="generatedToken">
					<p [innerHTML]="'Profile.idAndSecretSuccess' | translate"></p>
					<div class="forminput tw-py-4">
						<div class="forminput-x-inputs">
							<label class="forminput-x-label">Client ID</label>
							<input class="tw-w-full tw-p-2" type="text" disabled value="{{generatedToken.client_id}}">
						</div>
					</div>
					<div class="forminput">
						<div class="forminput-x-inputs">
							<label class="forminput-x-label">Client Secret</label>
							<input #secret class="tw-w-full tw-p-2" type="text" disabled value="{{generatedToken.client_secret}}">
						</div>
					</div>
				</div>
			</div>
		</div>

	</dialog>`,
})
export class AddCredentialsDialog extends BaseDialog {

	generatedToken = undefined;

	hasSubmitted = false;

	credentialsForm = typedFormGroup()
		.addControl('client_name', '', Validators.required)

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private applicationCredentialsService: ApplicationCredentialsService
		) {
		super(componentElem, renderer);
	}

	openDialog() {
		if (!this.isOpen) this.showModal();
	}


	generateCredentials(){
		this.hasSubmitted = true;
		this.applicationCredentialsService.generateCredentials(this.credentialsForm.value).then(res => {
			this.generatedToken = res;
		})
	}

	closeDialog() {
		this.closeModal();
	}

}
