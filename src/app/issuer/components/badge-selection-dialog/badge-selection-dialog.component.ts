import { Component, ElementRef, Renderer2 } from '@angular/core';

import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { BadgeClassUrl } from '../../models/badgeclass-api.model';
import { Issuer } from '../../models/issuer.model';
import { MessageService } from '../../../common/services/message.service';
import { combineLatest } from 'rxjs';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { SettingsService } from '../../../common/services/settings.service';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { first } from 'rxjs/operators';

export interface BadgeSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;
	multiSelectMode: boolean;
	restrictToIssuerId?: string;
	selectedBadges?: BadgeClass[];
	omittedBadges?: BadgeClass[];
}

type BadgeSortBy = 'name' | 'newest-first' | 'oldest-first';

export interface BadgeSelectionDialogSettings {
	groupByIssuer: boolean;
	badgeSortBy: BadgeSortBy;
}

@Component({
    selector: 'badge-selection-dialog',
    template: `
		<dialog class="dialog dialog-large">
			<section class="l-overflowlist">
				<!-- Header and Search Area -->
				<header class="l-childrenvertical l-childrenvertical-is-smalldesktop bordered bordered-bottom">
					<h1 class="title">{{ dialogTitle }}</h1>
					<div class="l-childrenhorizontal l-childrenhorizontal-stackmobile">
						<input type="text" class="search" placeholder="Filter your badges" [(ngModel)]="searchQuery" />
						<label *ngIf="!isRestrictedToSingleIssuer && hasMultipleIssuers" class="formcheckbox">
							<input type="checkbox" [(ngModel)]="groupByIssuer" />
							<span class="formcheckbox-x-text">Group by Issuer</span>
						</label>
					</div>
					<button (click)="cancelDialog()" class="buttonicon buttonicon-link">
						<svg icon="icon_close"></svg>
						<span class="visuallyhidden">Close</span>
					</button>
				</header>

				<!-- Badge List -->
				<div class="l-overflowlist-x-list">
					<table class="table table-dialog" *bgAwaitPromises="[badgesLoaded]">
						<thead>
							<tr>
								<th colspan="3">Badge</th>
							</tr>
						</thead>
						<tbody>
							<tr *ngIf="badgeResults.length < 1">
								<td class="table-x-padded" colspan="3">
									<ng-template [ngIf]="hasMultipleIssuers">
										No badges or issuers matching your query
									</ng-template>
									<ng-template [ngIf]="!hasMultipleIssuers">
										No badges matching your query
									</ng-template>
								</td>
							</tr>

							<ng-template [ngIf]="groupByIssuer && hasMultipleIssuers">
								<ng-template ngFor let-issuerResults [ngForOf]="issuerResults">
									<tr>
										<td colspan="3" class="table-x-inlineheader">
											{{ issuerResults.issuer?.name || 'Unknown Issuer' }}
										</td>
									</tr>
									<tr *ngFor="let badgeClass of issuerResults.badges">
										<td class="table-x-input">
											<input
												class="checklist"
												type="checkbox"
												id="badge-check-{{ badgeClass.badgeUrl }}"
												#badgeCheckbox
												[checked]="selectedBadges.has(badgeClass)"
												(change)="updateBadgeSelection(badgeClass, badgeCheckbox.checked)"
												*ngIf="multiSelectMode"
											/>
											<input
												class="checklist checklist-radio"
												type="radio"
												id="badge-check-{{ badgeClass.badgeUrl }}"
												#badgeRadio
												[checked]="selectedBadges.has(badgeClass)"
												(change)="updateBadgeSelection(badgeClass, badgeRadio.checked)"
												name="badge-selection-radio"
												*ngIf="!multiSelectMode"
											/>
											<label htmlFor="badge-check-{{ badgeClass.badgeUrl }}">{{
												badgeClass.name
											}}</label>
										</td>
										<td>
											<label
												htmlFor="badge-check-{{ badgeClass.badgeUrl }}"
												class="table-x-badge"
											>
												<img
													[src]="badgeClass.image"
													width="40"
													height="40"
													alt="{{ badgeClass.name }}"
												/>
											</label>
										</td>
										<td class="table-x-span">
											<label
												htmlFor="badge-check-{{ badgeClass.badgeUrl }}"
												class="stack stack-list table-x-stack"
											>
												<span class="stack-x-text">
													<h1>{{ badgeClass.name }}</h1>
													<small>{{ issuerResults.issuer?.name || 'Unknown Issuer' }}</small>
												</span>
											</label>
										</td>
									</tr>
								</ng-template>
							</ng-template>

							<ng-template [ngIf]="!groupByIssuer || !hasMultipleIssuers">
								<tr *ngFor="let badgeResult of badgeResults">
									<td class="table-x-input">
										<input
											class="checklist"
											type="checkbox"
											[id]="'badge-check-' + badgeResult.badge.badgeUrl"
											#badgeCheckbox
											[checked]="selectedBadges.has(badgeResult.badge)"
											(change)="updateBadgeSelection(badgeResult.badge, badgeCheckbox.checked)"
											*ngIf="multiSelectMode"
										/>
										<input
											class="checklist checklist-radio"
											type="radio"
											[id]="'badge-check-' + badgeResult.badge.badgeUrl"
											#badgeRadio
											[checked]="selectedBadges.has(badgeResult.badge)"
											(change)="updateBadgeSelection(badgeResult.badge, badgeRadio.checked)"
											name="badge-selection-radio"
											*ngIf="!multiSelectMode"
										/>
										<label htmlFor="badge-check-{{ badgeResult.badge.badgeUrl }}">{{
											badgeResult.badge.name
										}}</label>
									</td>
									<td>
										<label
											htmlFor="badge-check-{{ badgeResult.badge.badgeUrl }}"
											class="table-x-badge"
										>
											<img
												[src]="badgeResult.badge.image"
												width="40"
												height="40"
												alt="{{ badgeResult.badge.name }}"
											/>
										</label>
									</td>
									<td class="table-x-span">
										<label
											htmlFor="badge-check-{{ badgeResult.badge.badgeUrl }}"
											class="stack stack-list table-x-stack"
										>
											<span class="stack-x-text">
												<h1>{{ badgeResult.badge.name }}</h1>
												<small>{{ badgeResult.issuer?.name || 'Unknown Issuer' }}</small>
											</span>
										</label>
									</td>
								</tr>
							</ng-template>
						</tbody>
					</table>
				</div>

				<!-- Selected Badges and Buttons -->
				<footer class="bordered bordered-top">
					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<button class="button button-primaryghost" (click)="cancelDialog()">Cancel</button>
						<button class="button" (click)="saveDialog()">Save Changes</button>
					</div>
				</footer>
			</section>
		</dialog>
	`,
    standalone: false
})
export class BadgeSelectionDialog extends BaseDialog {
	get searchQuery() {
		return this._searchQuery;
	}

	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	get isRestrictedToSingleIssuer(): boolean {
		return !!this.restrictToIssuerId;
	}

	get badgeSortBy() {
		return this.settings.badgeSortBy;
	}

	set badgeSortBy(badgeSortBy: BadgeSortBy) {
		this.settings.badgeSortBy = badgeSortBy || 'name';
		this.applySorting();
		this.saveSettings();
	}

	get groupByIssuer() {
		return this.settings.groupByIssuer;
	}

	set groupByIssuer(value: boolean) {
		this.settings.groupByIssuer = value;
		this.saveSettings();
	}

	static defaultSettings: BadgeSelectionDialogSettings = {
		groupByIssuer: true,
		badgeSortBy: 'newest-first',
	};
	dialogId = 'badgeDialog';
	dialogTitle = 'Select Badges';

	multiSelectMode = false;
	restrictToIssuerId: string = null;

	selectedBadges = new Set<BadgeClass>();

	maxDisplayedResults = 100;
	badgeResults: BadgeResult[] = [];
	issuerResults: MatchingIssuerBadges[] = [];

	badgeClassesByIssuerUrl: { [issuerUrl: string]: BadgeClass[] };
	allBadges: BadgeClass[];
	allIssuers: Issuer[];

	hasMultipleIssuers = true;

	badgesLoaded: Promise<unknown>;
	settings: BadgeSelectionDialogSettings = Object.assign({}, BadgeSelectionDialog.defaultSettings);
	private omittedBadges = [];

	private resolveFunc: { (badges: BadgeClass[]): void };

	private _searchQuery = '';

	private loadedData = false;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private badgeManager: BadgeClassManager,
		private issuerManager: IssuerManager,
		private messageService: MessageService,
		private settingsService: SettingsService,
	) {
		super(componentElem, renderer);
	}

	openDialog({
		dialogId,
		dialogTitle = 'Select Badges',
		multiSelectMode = true,
		restrictToIssuerId = null,
		selectedBadges = [],
		omittedBadges = [],
	}: BadgeSelectionDialogOptions): Promise<BadgeClass[]> {
		this.showModal();
		this._searchQuery = '';

		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.multiSelectMode = multiSelectMode;
		this.restrictToIssuerId = restrictToIssuerId;

		this.selectedBadges = new Set<BadgeClass>(selectedBadges);
		this.omittedBadges = omittedBadges;

		this.loadSettings();
		this.updateData();

		return new Promise<BadgeClass[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(Array.from(this.selectedBadges.values()));
	}

	updateBadgeSelection(badgeClass: BadgeClass, select: boolean) {
		if (select) {
			this.selectedBadges.add(badgeClass);
		} else {
			this.selectedBadges.delete(badgeClass);
		}
	}

	applySorting() {
		const badgeSorter = (a: BadgeClass, b: BadgeClass) => {
			if (this.badgeSortBy === 'name') {
				const aName = a.name.toLowerCase();
				const bName = b.name.toLowerCase();

				return aName === bName ? 0 : aName < bName ? -1 : 1;
			} else if (this.badgeSortBy === 'newest-first') {
				return b.createdAt.getTime() - a.createdAt.getTime();
			} else if (this.badgeSortBy === 'oldest-first') {
				return a.createdAt.getTime() - b.createdAt.getTime();
			}
		};

		(this.badgeResults || []).sort((a, b) => badgeSorter(a.badge, b.badge));
		(this.issuerResults || []).forEach((i) => i.badges.sort(badgeSorter));
	}

	private loadSettings() {
		this.settings = this.settingsService.loadSettings(this.dialogId, BadgeSelectionDialog.defaultSettings);
	}

	private saveSettings() {
		this.settingsService.saveSettings(this.dialogId, this.settings);
	}

	private updateData() {
		this.badgesLoaded = combineLatest(
			this.badgeManager.badgesByIssuerUrl$,
			this.badgeManager.allBadges$,
			this.issuerManager.allIssuers$,
		)
			.pipe(first())
			.toPromise()
			.then(
				([badgesByIssuer, allBadges, issuers]) => this.updateBadges(badgesByIssuer, allBadges, issuers),
				(failure) => this.messageService.reportAndThrowError('Failed to load issuer and badge list.', failure),
			);
	}

	private updateBadges(
		badgesByIssuerUrl: { [issuerUrl: string]: BadgeClass[] },
		allBadges: BadgeClass[],
		issuers: Issuer[],
	) {
		this.loadedData = true;

		this.badgeClassesByIssuerUrl = badgesByIssuerUrl;
		this.allIssuers = issuers;
		this.allBadges = allBadges;

		this.hasMultipleIssuers = !this.restrictToIssuerId && new Set(allBadges.map((b) => b.issuerUrl)).size > 1;

		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		this.badgeResults.length = 0;
		this.issuerResults.length = 0;

		const issuerResultsByIssuer: { [issuerUrl: string]: MatchingIssuerBadges } = {};
		const addedBadgeIds = new Set<BadgeClassUrl>();

		const addBadgeToResults = (badge: BadgeClass) => {
			if (addedBadgeIds.has(badge.badgeUrl)) {
				return;
			} else {
				addedBadgeIds.add(badge.badgeUrl);
			}

			// Restrict Length
			if (this.badgeResults.length > this.maxDisplayedResults) {
				return false;
			}

			// Restrict to issuer
			if (this.restrictToIssuerId && badge.issuerUrl !== this.restrictToIssuerId) {
				return false;
			}

			// excluded omitted badges
			if (this.omittedBadges.indexOf(badge) === -1) {
				let issuerResults = issuerResultsByIssuer[badge.issuerUrl];
				if (!issuerResults) {
					issuerResults = issuerResultsByIssuer[badge.issuerUrl] = new MatchingIssuerBadges(
						badge.issuerUrl,
						this.allIssuers.find((i) => i.issuerUrl === badge.issuerUrl),
					);
					this.issuerResults.push(issuerResults);
				}

				issuerResults.addBadge(badge);

				if (!this.badgeResults.find((r) => r.badge === badge)) {
					this.badgeResults.push(new BadgeResult(badge, issuerResults.issuer));
				}
			}

			return true;
		};

		const addIssuerToResults = (issuer: Issuer) => {
			(this.badgeClassesByIssuerUrl[issuer.issuerUrl] || []).forEach(addBadgeToResults);
		};

		this.allIssuers.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery)).forEach(addIssuerToResults);

		this.allBadges.filter(MatchingAlgorithm.badgeMatcher(this.searchQuery)).forEach(addBadgeToResults);

		this.applySorting();
	}
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuer: Issuer,
	) {}
}

class MatchingIssuerBadges {
	constructor(
		public issuerSlug: string,
		public issuer: Issuer,
		public badges: BadgeClass[] = [],
	) {}

	addBadge(badge: BadgeClass) {
		if (badge.issuerUrl === this.issuerSlug) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer: Issuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) =>
			StringMatchingUtil.stringMatches(issuer.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp);
	}

	static badgeMatcher(inputPattern: string): (badge: BadgeClass) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) =>
			StringMatchingUtil.stringMatches(badge.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}
}
