import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { Issuer } from '../../models/issuer.model';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';

export interface TransformedImportData {
	duplicateRecords: BulkIssueData[];
	validRowsTransformed: Set<BulkIssueData>;
	invalidRowsTransformed: BulkIssueData[];
}

export interface BulkIssueImportPreviewData {
	columnHeaders: ColumnHeaders[];
	invalidRows: string[][];
	rowLongerThenHeader: boolean;
	rows: string[];
	validRows: string[][];
}

export interface BulkIssueData {
	email: string;
	name: string;
}

export type DestSelectOptions = 'email'| 'name' | 'NA' ;

export type ViewState = 'import' | 'importPreview' | 'importError' | 'importConformation' | 'cancel' | 'exit';

export interface ColumnHeaders {
	destColumn: DestSelectOptions;
	sourceName: string;
}

@Component({
	selector: 'Badgeclass-issue-bulk-award',
	templateUrl: './badgeclass-issue-bulk-award.component.html',
})
export class BadgeClassIssueBulkAwardComponent extends BaseAuthenticatedRoutableComponent {
	importPreviewData: BulkIssueImportPreviewData;
	transformedImportData: TransformedImportData;
	viewState: ViewState;
	badgeClass: BadgeClass;
	badgeClassLoaded: Promise<unknown>;

	issuer: Issuer;
	issuerLoaded: Promise<unknown>;

	breadcrumbLinkEntries: LinkEntry[] = [];

	constructor(
		protected badgeClassManager: BadgeClassManager,
		protected formBuilder: FormBuilder,
		protected issuerManager: IssuerManager,
		protected sessionService: SessionService,
		protected messageService: MessageService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected configService: AppConfigService,
		protected title: Title,
	) {
		super(router, route, sessionService);

		this.updateViewState('import');

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.badgeClassLoaded = this.badgeClassManager
				.badgeByIssuerUrlAndSlug(issuer.issuerUrl, this.badgeSlug)
				.then((badgeClass) => {
					this.badgeClass = badgeClass;
					this.title.setTitle(
						`Bulk Award Badge - ${badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
					);
					this.breadcrumbLinkEntries = [
						{ title: 'Issuers', routerLink: ['/issuer'] },
						{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
						{
							title: badgeClass.name,
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug],
						},
						{ title: 'Bulk Award Badge' },
					];
				});
		});
	}

	onBulkIssueImportPreviewData(importPreviewData: BulkIssueImportPreviewData) {
		this.importPreviewData = importPreviewData;
		this.updateViewState('importPreview');
	}

	onTransformedImportData(transformedImportData) {
		this.transformedImportData = transformedImportData;

		// Determine if the transformed data contains any errors
		this.transformedImportData && transformedImportData.invalidRowsTransformed.length
			? this.updateViewState('importError')
			: this.updateViewState('importConformation');
	}

	updateViewState(state: ViewState) {
		if (state === 'cancel') {
			this.navigateToIssueBadgeInstance();
			return;
		}
		this.viewState = state;
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	navigateToIssueBadgeInstance() {
		this.router.navigate(['/issuer/issuers', this.issuer.slug, 'badges', this.badgeSlug]);
	}

	createRange(size: number) {
		const items: string[] = [];
		for (let i = 1; i <= size; i++) {
			items.push('');
		}
		return items;
	}
}
