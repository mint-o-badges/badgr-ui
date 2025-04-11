import { Component, ViewChild, TemplateRef, inject, AfterViewInit } from '@angular/core';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { FormBuilder } from '@angular/forms';
import { UrlValidator } from '../../../common/validators/url.validator';
import { JsonValidator } from '../../../common/validators/json.validator';
import { MessageService } from '../../../common/services/message.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { preloadImageURL } from '../../../common/util/file-util';
import { TypedFormControl, typedFormGroup } from '../../../common/util/typed-forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { DialogComponent } from '../../../components/dialog.component';
import { OebTabsComponent, Tab } from '../../../components/oeb-backpack-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import {
	UploadTabComponent,
	JsonTabComponent,
	UrlTabComponent,
} from '../upload-badge-tabs/upload-badge-tabs.component';

@Component({
	selector: 'add-badge-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		UploadTabComponent,
		UrlTabComponent,
		JsonTabComponent,
		TranslateModule,
		OebTabsComponent,
	],
	template: `
		<!-- Template for the dialog header -->
		<ng-template #dialogHeader>
			<h2 id="addBadgeDialog" class="u-text-body-bold-caps text-dark1">
				{{ 'RecBadge.addBadge' | translate }}
			</h2>
		</ng-template>

		<!-- Tab content templates -->
		<ng-template #uploadTabTemplate>
			<app-upload-tab
				[form]="addRecipientBadgeForm"
				[uploadBadgeImageUrl]="uploadBadgeImageUrl"
				(controlUpdated)="controlUpdated($event)"
			></app-upload-tab>
		</ng-template>

		<ng-template #urlTabTemplate>
			<app-url-tab [form]="addRecipientBadgeForm" (controlUpdated)="controlUpdated($event)"></app-url-tab>
		</ng-template>

		<ng-template #jsonTabTemplate>
			<app-json-tab [form]="addRecipientBadgeForm" (controlUpdated)="controlUpdated($event)"></app-json-tab>
		</ng-template>

		<!-- Dialog content template -->
		<ng-template #dialogContent>
			<form [formGroup]="addRecipientBadgeForm.rawControl" (ngSubmit)="submitBadgeRecipientForm()">
				<p class="u-padding-yaxis2x u-responsivepadding-xaxis border-light3 u-text-body u-background-light3">
					{{ 'RecBadge.addRecievedBadge' | translate }}
				</p>

				<oeb-backpack-tabs
					[tabs]="tabs"
					[activeTab]="currentTab"
					(onTabChanged)="currentTab = $event"
				></oeb-backpack-tabs>

				<div *ngIf="formError" class="u-padding-all3x">
					<div class="notification notification-warning notification-is-active">
						<div class="notification-x-icon">
							<svg icon="icon_priority_high"></svg>
						</div>
						<div class="notification-x-text">
							<h2>Uh Oh...</h2>
							<p>{{ formError }}</p>
						</div>
						<button class="notification-x-close buttonicon buttonicon-clear" (click)="clearFormError()">
							<svg icon="icon_close"></svg>
							<span class="visuallyhidden">{{ 'RecBadge.closeNotification' | translate }}</span>
						</button>
					</div>
				</div>

				<div class="u-responsivepadding-xaxis u-responsivepadding-yaxis l-stack l-stack-right">
					<button
						class="button"
						type="submit"
						[loading-promises]="[badgeUploadPromise]"
						loading-message="Hinzufügen"
					>
						{{ 'RecBadge.addBadge' | translate }}
					</button>
				</div>
			</form>
		</ng-template>
	`,
})
export class AddBadgeDialogComponent implements AfterViewInit {
	@ViewChild('dialogHeader') dialogHeader: TemplateRef<void>;
	@ViewChild('dialogContent') dialogContent: TemplateRef<void>;
	@ViewChild('uploadTabTemplate') uploadTabTemplate: TemplateRef<void>;
	@ViewChild('urlTabTemplate') urlTabTemplate: TemplateRef<void>;
	@ViewChild('jsonTabTemplate') jsonTabTemplate: TemplateRef<void>;

	readonly uploadBadgeImageUrl = '../../../../breakdown/static/images/image-uplodBadge.svg';
	readonly pasteBadgeImageUrl = preloadImageURL('../../../../breakdown/static/images/image-uplodBadgeUrl.svg');

	addRecipientBadgeForm = typedFormGroup()
		.addControl('image', null)
		.addControl('url', '', UrlValidator.validUrl)
		.addControl('assertion', '', JsonValidator.validJson);

	formError: string;
	currentTab: string = 'upload';
	badgeUploadPromise: Promise<unknown>;
	tabs: Tab[] = [];

	private dialogRef: BrnDialogRef;
	private _hlmDialogService = inject(HlmDialogService);

	constructor(
		protected recipientBadgeManager: RecipientBadgeManager,
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		private translate: TranslateService,
	) {}

	ngAfterViewInit() {
		// Initialize tabs after view is initialized to get template references
		setTimeout(() => {
			this.tabs = [
				{
					title: this.translate.instant('RecBadge.image'),
					component: this.uploadTabTemplate,
				},
				{
					title: 'URL',
					component: this.urlTabTemplate,
				},
				{
					title: 'JSON',
					component: this.jsonTabTemplate,
				},
			];
		});
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
	 * Opens the badge dialog
	 * @returns {Promise<void>}
	 */
	openDialog(): Promise<void> {
		this.addRecipientBadgeForm.reset();
		this.currentTab = this.translate.instant('RecBadge.image');

		// Wait for the template refs to be available
		setTimeout(() => {
			this.dialogRef = this._hlmDialogService.open(DialogComponent, {
				context: {
					headerTemplate: this.dialogHeader,
					variant: 'default',
					content: this.dialogContent,
				},
			});
		});

		return new Promise<void>((resolve, reject) => {
			this.dialogRef?.closed$.subscribe((result) => {
				if (result === 'cancel') {
					reject();
				} else {
					resolve();
				}
			});
		});
	}

	closeDialog() {
		this.dialogRef?.close();
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
				.then((instance) => {
					this.messageService.reportMajorSuccess(this.translate.instant('RecBadge.importedSuccessfully'));
					this.closeDialog();
				})
				.catch((err) => {
					let message = BadgrApiFailure.from(err).firstMessage;

					// display human readable description of first error if provided by server
					if (this.isJson(message)) {
						const jsonErr = JSON.parse(message);
						if (err.response && err.response._body) {
							const body = JSON.parse(err.response._body);
							if (body && body.length > 0 && body[0].description) {
								message = body[0].description;
							}
						} else if (jsonErr.length) {
							message = jsonErr[0].result || jsonErr[0].description;
						}
					}

					this.messageService.reportAndThrowError(
						message
							? this.translate.instant('RecBadge.uploadFailed') + message
							: this.translate.instant('RecBadge.unknownError'),
						err,
					);
				})
				.catch((e) => {
					this.closeDialog();
					throw e;
				});
		} else {
			this.formError = this.translate.instant('RecBadge.oneBadgeRequired');
		}
	}

	controlUpdated(updatedControl: TypedFormControl<unknown>) {
		// Clear the value from other controls
		this.addRecipientBadgeForm.controlsArray.forEach((control) => {
			if (control !== updatedControl) {
				control.reset();
			}
		});
	}

	clearFormError() {
		this.formError = undefined;
	}
}
