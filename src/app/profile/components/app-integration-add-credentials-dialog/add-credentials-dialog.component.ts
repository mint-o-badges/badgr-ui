import { Component, ElementRef, Renderer2, Output, EventEmitter, inject } from '@angular/core';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { ApplicationCredentialsService } from '../../../common/services/application-credentials.service.';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../../common/components/svg-icon.component';
import { FormFieldText } from '../../../common/components/formfield-text';
import { TranslatePipe } from '@ngx-translate/core';

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
				<h2 class="u-text-body-bold-caps text-dark1">{{ 'Profile.newCredentials' | translate }}</h2>
				<button class="buttonicon buttonicon-link" (click)="closeDialog()">
					<svg icon="icon_close"></svg>
					<span class="visuallyhidden">Close</span>
				</button>
			</div>
			<div class="u-padding-yaxis2x u-margin-xaxis2x border border-top border-light3">
				<form
					[formGroup]="credentialsForm.rawControl"
					#formElem
					(ngSubmit)="generateCredentials()"
					novalidate
					class="l-responsivelist"
				>
					<span class="tw-font-bold tw-text-lg tw-text-black tw-uppercase">{{
						'Profile.chooseName' | translate
					}}</span>
					<bg-formfield-text
						class="tw-py-4"
						[control]="credentialsForm.rawControlMap.client_name"
						[errorMessage]="{
							required: 'Name erforderlich',
						}"
						[autofocus]="true"
					></bg-formfield-text>
					<button
						[disabled]="!credentialsForm.valid || hasSubmitted"
						type="submit"
						class="oeb-button oeb-purple-bg tw-bg-purple !tw-font-bold"
					>
						{{ 'Profile.idAndSecret' | translate }}
					</button>
				</form>
			</div>
		</div>
	</dialog>`,
	imports: [SvgIconComponent, FormsModule, ReactiveFormsModule, FormFieldText, TranslatePipe],
})
export class AddCredentialsDialog extends BaseDialog {
	private applicationCredentialsService = inject(ApplicationCredentialsService);

	@Output() newTokenAdded = new EventEmitter();

	hasSubmitted = false;

	credentialsForm = typedFormGroup().addControl('client_name', '', Validators.required);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const componentElem = inject(ElementRef);
		const renderer = inject(Renderer2);

		super(componentElem, renderer);
	}

	openDialog() {
		if (!this.isOpen) this.showModal();
	}

	generateCredentials() {
		this.hasSubmitted = true;
		this.applicationCredentialsService.generateCredentials(this.credentialsForm.value).then((res) => {
			this.newTokenAdded.emit(res);
			this.closeModal();
			this.hasSubmitted = false;
		});
	}

	closeDialog() {
		this.closeModal();
	}
}
