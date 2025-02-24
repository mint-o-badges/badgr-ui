import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { TransformedImportData, ViewState } from '../badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';

import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { BadgeInstanceBatchAssertion } from '../../models/badgeinstance-api.model';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import striptags from 'striptags';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { HlmDialogService } from './../../../components/spartan/ui-dialog-helm/src';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgeInstanceApiService } from '../../services/badgeinstance-api.service';

@Component({
	selector: 'badgeclass-issue-bulk-award-confirmation',
	templateUrl: './badgeclass-issue-bulk-award-confirmation.component.html',
})
export class BadgeclassIssueBulkAwardConformation extends BaseAuthenticatedRoutableComponent {
	@Input() transformedImportData: TransformedImportData;
	@Input() badgeSlug: string;
	@Input() issuerSlug: string;
	@Output() updateStateEmitter = new EventEmitter<ViewState>();

	buttonDisabledClass = true;
	buttonDisabledAttribute = true;
	issuer: string;

	issueBadgeFinished: Promise<unknown>;

	constructor(
		protected badgeInstanceManager: BadgeInstanceManager,
		protected badgeInstanceApiService: BadgeInstanceApiService,
		protected sessionService: SessionService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected messageService: MessageService,
		protected formBuilder: FormBuilder,
		protected title: Title,
	) {
		super(router, route, sessionService);
		this.enableActionButton();
	}

	issueForm = typedFormGroup()
		.addControl('notify_earner', true)

	enableActionButton() {
		this.buttonDisabledClass = false;
		this.buttonDisabledAttribute = null;
	}

	disableActionButton() {
		this.buttonDisabledClass = true;
		this.buttonDisabledAttribute = true;
	}

	dataConfirmed() {
		this.disableActionButton();

		const assertions: BadgeInstanceBatchAssertion[] = [];
		const recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';
		this.transformedImportData.validRowsTransformed.forEach((row) => {
			let assertion: BadgeInstanceBatchAssertion;

			const extensions = row.name
				? {
						'extensions:recipientProfile': {
							'@context': recipientProfileContextUrl,
							type: ['Extension', 'extensions:RecipientProfile'],
							name: striptags(row.name),
						},
					}
				: undefined;

				assertion = {
					recipient_identifier: row.email,
					extensions: extensions,
				};
			assertions.push(assertion);
		});

		const checkStatus = async (taskId: string) => {
			const response = await this.badgeInstanceApiService.checkBatchAssertionStatus(taskId, this.issuerSlug, this.badgeSlug);
			if (response.body['status'] === 'SUCCESS') {
			  return response.body['result'];
			} else if (response.body['status'] === 'FAILURE') {
			  throw new Error(response.body['result']);
			}
			console.log("response", response)
			// Continue polling if still processing
			await new Promise(resolve => setTimeout(resolve, 2000));
			return checkStatus(taskId);
		  };

		this.badgeInstanceApiService.createBadgeInstanceBatchedAsync(this.issuerSlug, this.badgeSlug, {
			issuer: this.issuerSlug,
			badge_class: this.badgeSlug,
			create_notification: this.issueForm.rawControlMap.notify_earner.value,
			assertions,
		}).then((response) => {
			const taskId = response.body.task_id;
			checkStatus(taskId)
		})

	// 	this.badgeInstanceManager
	// 		.createBadgeInstanceBatched(this.issuerSlug, this.badgeSlug, {
	// 			issuer: this.issuerSlug,
	// 			badge_class: this.badgeSlug,
	// 			create_notification: this.issueForm.rawControlMap.notify_earner.value,
	// 			assertions,
	// 		})
	// 		.then(
	// 			(result) => {
	// 				this.openSuccessDialog(assertions.length + " User")
	// 				this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
	// 			},
	// 			(error) => {
	// 				this.messageService.setMessage(
	// 					'Fast geschafft! Deine Badges werden gerade vergeben – das kann ein paar Minuten dauern. Schau gleich auf der Badge-Detail-Seite nach, ob alles geklappt hat.' ,
	// 					'error',
	// 				);
	// 			},
	// 		);
	 }

	updateViewState(state: ViewState) {
		this.updateStateEmitter.emit(state);
	}

	removeValidRowsTransformed(row) {
		this.transformedImportData.validRowsTransformed.delete(row);
		if (!this.transformedImportData.validRowsTransformed.size) {
			this.disableActionButton();
		}
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog(recipient) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
				variant: "success"
			},
		});
	}
}
