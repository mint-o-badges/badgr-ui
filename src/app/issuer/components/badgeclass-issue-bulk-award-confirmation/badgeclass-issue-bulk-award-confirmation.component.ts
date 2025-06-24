import { Component, EventEmitter, Input, Output, inject, OnDestroy } from '@angular/core';
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
import { TaskStatus, TaskResult, TaskPollingManagerService } from '../../../common/task-manager.service';
import { Subscription } from 'rxjs';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { NgFor } from '@angular/common';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmH3Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';

@Component({
    selector: 'badgeclass-issue-bulk-award-confirmation',
    templateUrl: './badgeclass-issue-bulk-award-confirmation.component.html',
    imports: [
        HlmH1Directive,
        HlmPDirective,
        NgFor,
        OebButtonComponent,
        HlmH3Directive,
        OebCheckboxComponent,
        TranslatePipe,
    ],
})
export class BadgeclassIssueBulkAwardConformation extends BaseAuthenticatedRoutableComponent implements OnDestroy {
	@Input() transformedImportData: TransformedImportData;
	@Input() badgeSlug: string;
	@Input() issuerSlug: string;
	@Output() updateStateEmitter = new EventEmitter<ViewState>();

	buttonDisabledClass = true;
	buttonDisabledAttribute = true;
	issuer: string;

	issueBadgeFinished: Promise<unknown>;

	private taskSubscription: Subscription | null = null;
	currentTaskStatus: TaskResult | null = null;

	constructor(
		protected badgeInstanceManager: BadgeInstanceManager,
		protected badgeInstanceApiService: BadgeInstanceApiService,
		protected sessionService: SessionService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected messageService: MessageService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected taskService: TaskPollingManagerService,
		protected translate: TranslateService,
	) {
		super(router, route, sessionService);
		this.enableActionButton();
	}

	ngOnDestroy() {
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}
	}

	issueForm = typedFormGroup().addControl('notify_earner', true);

	enableActionButton() {
		this.buttonDisabledClass = false;
		this.buttonDisabledAttribute = null;
	}

	disableActionButton() {
		this.buttonDisabledClass = true;
		this.buttonDisabledAttribute = true;
	}

	dataConfirmed() {
		if (this.buttonDisabledAttribute) return;
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

		this.badgeInstanceApiService
			.createBadgeInstanceBatchedAsync(this.issuerSlug, this.badgeSlug, {
				issuer: this.issuerSlug,
				badge_class: this.badgeSlug,
				create_notification: this.issueForm.rawControlMap.notify_earner.value,
				assertions,
			})
			.then((response) => {
				const taskId = response.body.task_id;
				this.startTaskPolling(taskId);

				this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
			})
			.catch((error) => {
				console.error('Error creating badge batch:', error);
				this.enableActionButton(); // Re-enable the button on error

				// Show error message to user
				this.messageService.reportHandledError('Failed to start batch award process. Please try again.', error);
			});
	}

	private startTaskPolling(taskId: string) {
		// Clean up any existing subscription
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}

		this.taskSubscription = this.taskService.startTaskPolling(taskId, this.issuerSlug, this.badgeSlug).subscribe(
			(taskResult: TaskResult) => {
				this.currentTaskStatus = taskResult;

				if (taskResult.status === TaskStatus.FAILURE) {
					this.handleTaskFailure(taskResult);
				}
			},
			(error) => {
				console.error('Error polling batch award task status:', error);
				this.handleTaskError(error);
			},
		);
	}

	private handleTaskFailure(taskResult: TaskResult) {
		const errorMessage = taskResult.result?.error || 'An error occurred during the batch award process.';
		this.messageService.reportHandledError(this.translate.instant('Issuer.batchAwardFailed'), errorMessage);
	}

	private handleTaskError(error: any) {
		this.messageService.reportHandledError(this.translate.instant('Issuer.failedBatchMonitoring'), error);
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
				variant: 'success',
			},
		});
	}
}
