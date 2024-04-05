import { Component, EventEmitter, Input, Output } from '@angular/core';
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
	notifyEarner = true;

	issueBadgeFinished: Promise<unknown>;

	constructor(
		protected badgeInstanceManager: BadgeInstanceManager,
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

		this.transformedImportData.validRowsTransformed.forEach((row) => {
			let assertion: BadgeInstanceBatchAssertion;
			if (row.evidence) {
				assertion = {
					recipient_identifier: row.email,
					evidence_items: [{ evidence_url: row.evidence }],
				};
			} else {
				assertion = {
					recipient_identifier: row.email,
				};
			}
			assertions.push(assertion);
		});

		this.badgeInstanceManager
			.createBadgeInstanceBatched(this.issuerSlug, this.badgeSlug, {
				issuer: this.issuerSlug,
				badge_class: this.badgeSlug,
				create_notification: this.notifyEarner,
				assertions,
			})
			.then(
				(result) => {
					this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
				},
				(error) => {
					this.messageService.setMessage(
						'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
						'error',
					);
				},
			);
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
}
