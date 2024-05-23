import { Component, ElementRef, Renderer2, Output, EventEmitter, Input } from '@angular/core';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-integration-details-dialog',
	template: ` <dialog
		aria-labelledby="addCredentialsDialog"
		aria-describedby="dialog1Desc"
		class="dialog dialog-is-active l-dialog"
		role="dialog"
	>
		<div class="dialog-x-box o-container">
			<div class="dialog-x-header">
				<h2 class="u-text-body-bold-caps text-dark1">Details</h2>
				<button class="buttonicon buttonicon-link" (click)="closeDialog()">
					<svg icon="icon_close"></svg>
					<span class="visuallyhidden">Close</span>
				</button>
			</div>
			<div class="u-padding-yaxis2x u-margin-xaxis2x border border-top border-light3">
				<div *ngIf="credentials" class="tw-px-4 tw-my-6">
					<div>
						<h2 class="tw-font-extrabold md:tw-text-[30px] md:tw-leading-[36px] tw-text-purple tw-text-[20px] tw-leading-[24px] tw-py-4">{{credentials.name}}</h2>
						<div class="forminput tw-py-4">
							<div class="forminput-x-inputs">
								<label class="forminput-x-label">Client ID</label>
								<input class="tw-w-full tw-p-2" type="text" disabled value="{{credentials.clientId}}">
							</div>
						</div>
					</div>
				</div>
				<div class="tw-flex tw-justify-between">
					<button class="oeb-button oeb-red-bg tw-bg-purple !tw-font-bold" (click)="deleteCredentials(credentials)">
						{{'General.delete' | translate}}
					</button>
					<button class="oeb-button oeb-purple-bg tw-bg-purple !tw-font-bold" (click)="closeDialog()">
						Ok
					</button>
				</div>
			</div>
		</div>

	</dialog>`,
})
export class AppIntegrationDetailsDialog extends BaseDialog {

	@Output() tokenDeleted = new EventEmitter();
	public credentials;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		translate: TranslateService
		) {
		super(componentElem, renderer);
	}
	
	openDialog(value) {
		this.credentials = value
		if (!this.isOpen) this.showModal();
	}


	deleteCredentials(credentials){
		this.closeDialog();
		this.tokenDeleted.emit(credentials);
	}

	closeDialog() {
		this.closeModal();
	}
}
