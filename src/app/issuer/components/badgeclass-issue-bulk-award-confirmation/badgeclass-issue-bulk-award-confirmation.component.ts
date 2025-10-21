import {
	Component,
	EventEmitter,
	Input,
	Output,
	inject,
	OnDestroy,
	AfterViewChecked,
	ViewChildren,
	QueryList,
	ElementRef,
	OnInit,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import {
	BulkIssueData,
	TransformedImportData,
	ViewState,
} from '../badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { BadgeInstanceBatchAssertion } from '../../models/badgeinstance-api.model';
import striptags from 'striptags';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { HlmDialogService } from './../../../components/spartan/ui-dialog-helm/src';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgeInstanceApiService } from '../../services/badgeinstance-api.service';
import { TaskStatus, TaskResult, TaskPollingManagerService } from '../../../common/task-manager.service';
import { Subscription } from 'rxjs';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { HlmH1, HlmP, HlmH3 } from '@spartan-ng/helm/typography';
import { NgClass } from '@angular/common';
import tlds from '../../../../assets/data/tld-list.json';
import { FormsModule } from '@angular/forms';
import { isValidEmail } from '~/common/util/is-valid-email';

@Component({
	selector: 'badgeclass-issue-bulk-award-confirmation',
	templateUrl: './badgeclass-issue-bulk-award-confirmation.component.html',
	imports: [HlmH1, HlmP, OebButtonComponent, HlmH3, OebCheckboxComponent, TranslatePipe, NgClass, FormsModule],
})
export class BadgeclassIssueBulkAwardConformation
	extends BaseAuthenticatedRoutableComponent
	implements OnDestroy, AfterViewChecked, OnInit
{
	@Input() transformedImportData: TransformedImportData;
	@Input() badgeSlug: string;
	@Input() issuerSlug: string;
	@Output() updateStateEmitter = new EventEmitter<ViewState>();

	@ViewChildren('emailInput') emailInputs!: QueryList<ElementRef<HTMLInputElement>>;

	buttonDisabledClass = true;
	buttonDisabledAttribute = true;
	issuer: string;

	issueBadgeFinished: Promise<unknown>;

	private taskSubscription: Subscription | null = null;
	currentTaskStatus: TaskResult | null = null;

	private focusedRow: BulkIssueData | null = null;

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
	}

	ngOnInit(): void {
		this.enableActionButton();
	}

	ngOnDestroy() {
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}
	}

	enableActionButton() {
		this.buttonDisabledClass = this.hasInvalidEmails;
		this.buttonDisabledAttribute = null;
	}

	disableActionButton() {
		this.buttonDisabledClass = true;
		this.buttonDisabledAttribute = true;
	}

	get hasInvalidEmails(): boolean {
		if (!this.transformedImportData?.validRowsTransformed) return false;

		return Array.from(this.transformedImportData.validRowsTransformed).some((row) => row.emailInvalid);
	}

	get invalidEmailCount(): number {
		if (!this.transformedImportData?.validRowsTransformed) return 0;
		return Array.from(this.transformedImportData.validRowsTransformed).filter((row) => row.emailInvalid).length;
	}

	startEditing(row: BulkIssueData) {
		row.isEditing = true;
		this.focusedRow = row;
	}

	cancelEditing(row: BulkIssueData) {
		row.isEditing = false;
	}

	saveEdit(row: BulkIssueData) {
		row.isEditing = false;

		row.emailInvalid = !isValidEmail(row.email);

		this.buttonDisabledClass = this.hasInvalidEmails;
		this.buttonDisabledAttribute = this.hasInvalidEmails;
	}

	onEditFocus(row: BulkIssueData) {
		this.focusedRow = row;
	}

	ngAfterViewChecked() {
		if (this.focusedRow) {
			const input = this.emailInputs.find(
				(ref) => ref.nativeElement && ref.nativeElement.value === this.focusedRow.email,
			);
			if (input) {
				input.nativeElement.focus();
				this.focusedRow = null;
			}
		}
	}

	dataConfirmed() {
		if (this.buttonDisabledAttribute) return;
		this.disableActionButton();

		const assertions: BadgeInstanceBatchAssertion[] = [];
		const recipientProfileContextUrl =
			'https://api.openbadges.education/static/extensions/recipientProfile/context.json';

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
				create_notification: true,
				assertions,
			})
			.then((response) => {
				const taskId = response.body.task_id;
				this.startTaskPolling(taskId);

				this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug], {
					queryParams: { tab: 'recipients' },
				});
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
