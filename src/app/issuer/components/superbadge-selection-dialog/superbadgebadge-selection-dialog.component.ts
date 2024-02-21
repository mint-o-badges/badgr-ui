import {Component, ElementRef, Input, Renderer2} from '@angular/core';
import {MessageService} from '../../../common/services/message.service';
import {StringMatchingUtil} from '../../../common/util/string-matching-util';
import {SettingsService} from '../../../common/services/settings.service';
import {ApiRecipientBadgeIssuer} from '../../../recipient/models/recipient-badge-api.model';
// import {RecipientBadgeManager} from '../../../recipient/services/recipient-badge-manager.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import {RecipientBadgeInstance} from '../../../recipient/models/recipient-badge.model';
// import {BadgeInstanceUrl} from '../../models/badgeinstance-api.model';
// import {groupIntoArray, groupIntoObject} from '../../../common/util/array-reducers';
import {BaseDialog} from '../../../common/dialogs/base-dialog';
import { BadgeClass } from '../../models/badgeclass.model';

export interface SuperBadgeSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;
	multiSelectMode: boolean;
	restrictToIssuerId?: string;
	omittedCollection?: RecipientBadgeInstance[];
}

// type BadgeSortBy = "name" | "newest-first" | "oldest-first";

// export interface SuperBadgeSelectionDialogSettings {
// 	groupByIssuer: boolean;
// 	badgeSortBy: BadgeSortBy;
// }

@Component({
	selector: 'superbadge-selection-dialog',
	templateUrl: './superbadge-selection-dialog.component.html'
})
export class SuperBadgeSelectionDialog extends BaseDialog {
	@Input() badgeClasses: BadgeClass[];
	// get searchQuery() { return this._searchQuery; }

	// set searchQuery(query) {
	// 	this._searchQuery = query;
	// 	this.updateResults();
	// }

	// get isRestrictedToSingleIssuer(): boolean {
	// 	return !!this.restrictToIssuerId;
	// }

	// get badgeSortBy() { return this.settings.badgeSortBy; }

	// set badgeSortBy(badgeSortBy: BadgeSortBy) {
	// 	this.settings.badgeSortBy = badgeSortBy || "name";
	// 	this.applySorting();
	// 	this.saveSettings();
	// }

	// get groupByIssuer() { return this.settings.groupByIssuer; }

	// set groupByIssuer(value: boolean) {
	// 	this.settings.groupByIssuer = value;
	// 	this.saveSettings();
	// }

	// static defaultSettings: SuperBadgeSelectionDialogSettings = {
	// 	groupByIssuer: true,
	// 	badgeSortBy: "newest-first"
	// };
	dialogId = "SuperBadgeDialog";
	dialogTitle = "Select Badges";

	multiSelectMode = false;
	restrictToIssuerId: string = null;
	selectedBadges = new Set<BadgeClass>();

	maxDisplayedResults = 100;
	badgeResults: BadgeClass[] = [];
	// issuerResults: MatchingIssuerBadges[] = [];

	// badgeClassesByIssuerId: { [issuerUrl: string]: RecipientBadgeInstance[] };
	allBadges: BadgeClass[];
	// allIssuers: ApiRecipientBadgeIssuer[];

	// hasMultipleIssuers = true;

	badgesLoaded: Promise<unknown>;
	// settings: SuperBadgeSelectionDialogSettings = Object.assign({}, SuperBadgeSelectionDialog.defaultSettings);

	// private omittedCollection: RecipientBadgeInstance[];
	private resolveFunc: { (badges: BadgeClass[]): void };

	// private _searchQuery = "";

	private loadedData = false;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private badgeManager: BadgeClassManager,
		private messageService: MessageService,
		// private settingsService: SettingsService
	) {

		super(componentElem, renderer);
	}

	openDialog(
		{
			dialogId,
			dialogTitle = "Select Badges",
			multiSelectMode = true,
			// restrictToIssuerId = null,
			// omittedCollection = []
		}: SuperBadgeSelectionDialogOptions
	): Promise<BadgeClass[]> {
		this.showModal();
		// this._searchQuery = "";
		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.multiSelectMode = multiSelectMode;
		// this.restrictToIssuerId = restrictToIssuerId;
		this.selectedBadges.clear();

		// this.omittedCollection = omittedCollection;
		// this.loadSettings();
		this.updateData();

		return new Promise<BadgeClass[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		console.log(this.selectedBadges)
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

	// applySorting() {
	// 	const badgeSorter = (a: RecipientBadgeInstance, b: RecipientBadgeInstance) => {
	// 		if (this.badgeSortBy === "name") {
	// 			const aName = a.badgeClass.name.toLowerCase();
	// 			const bName = b.badgeClass.name.toLowerCase();

	// 			return aName === bName ? 0 : (aName < bName ? -1 : 1);
	// 		} else if (this.badgeSortBy === "newest-first") {
	// 			return b.issueDate.getTime() - a.issueDate.getTime();
	// 		} else if (this.badgeSortBy === "oldest-first") {
	// 			return a.issueDate.getTime() - b.issueDate.getTime();
	// 		}
	// 	};

	// 	(this.badgeResults || []).sort((a, b) => badgeSorter(a.badge, b.badge));
	// 	(this.issuerResults || []).forEach(i => i.badges.sort(badgeSorter));
	// }

	// private loadSettings() {
	// 	this.settings = this.settingsService.loadSettings(this.dialogId, SuperBadgeSelectionDialog.defaultSettings);
	// }

	// private saveSettings() {
	// 	this.settingsService.saveSettings(this.dialogId, this.settings);
	// }

	private updateData() {
		this.badgesLoaded =
			this.badgeManager.allBadgesList.loadedPromise
				.then(
					list => this.updateBadges(list.entities),
					err => this.messageService.reportAndThrowError("Failed to load badge list", err)
				);
		console.log(this.badgeClasses)		
	}

	private updateBadges(allBadges: BadgeClass[]) {
		this.loadedData = true;

		// this.badgeClassesByIssuerId = allBadges
		// 	.reduce(groupIntoObject<RecipientBadgeInstance>(b => b.issuerId), {});

		// this.allIssuers = allBadges
		// 	.reduce(groupIntoArray<RecipientBadgeInstance, string>(b => b.issuerId), [])
		// 	.map(g => g.values[0].badgeClass.issuer);

		this.allBadges = allBadges;

		// this.hasMultipleIssuers = ! this.restrictToIssuerId && (new Set(allBadges.map(b => b.issuerId))).size > 1;

		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		// this.badgeResults.length = 0;
		// this.issuerResults.length = 0;

		// const issuerResultsByIssuer: {[issuerUrl: string]: MatchingIssuerBadges} = {};
		// const addedBadgeUrls = new Set<BadgeInstanceUrl>();

		const addBadgeToResults = (badge: BadgeClass) => {
			// if (addedBadgeUrls.has(badge.url)) {
			// 	return;
			// } else {
			// 	addedBadgeUrls.add(badge.url);
			// }

			// Restrict Length
			// if (this.badgeResults.length > this.maxDisplayedResults) {
			// 	return false;
			// }

			// Restrict to issuer
			// if (this.restrictToIssuerId && badge.issuerId !== this.restrictToIssuerId) {
			// 	return false;
			// }

			// excluded omitted badges
			// if (this.omittedCollection.indexOf(badge) === -1) {

			// 	let issuerResults = issuerResultsByIssuer[ badge.issuerId ];
			// 	if (!issuerResults) {
			// 		issuerResults = issuerResultsByIssuer[ badge.issuerId ] = new MatchingIssuerBadges(
			// 			badge.issuerId,
			// 			badge.badgeClass.issuer
			// 		);
			// 		this.issuerResults.push(issuerResults);
			// 	}

				// TODO: do this server side maybe?
				// exclude pending badges
			// 	if(badge.mostRelevantStatus !== 'pending') issuerResults.addBadge(badge);


			// 	if (!this.badgeResults.find(r => r.badge === badge)) {
			// 		this.badgeResults.push(new BadgeResult(badge, issuerResults.issuer));
			// 	}
			// }

			return true;

		};

	// 	const addIssuerToResults = (issuer: ApiRecipientBadgeIssuer) => {
	// 		(this.badgeClassesByIssuerId[ issuer.id ] || []).forEach(addBadgeToResults);
	// 	};

	// 	this.allIssuers
	// 		.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
	// 		.forEach(addIssuerToResults);

	// 	this.allBadges
	// 		.filter(MatchingAlgorithm.badgeMatcher(this.searchQuery))
	// 		.forEach(addBadgeToResults);

	// 	this.applySorting();
	}
}

// class BadgeResult {
// 	constructor(public badge: RecipientBadgeInstance, public issuer: ApiRecipientBadgeIssuer) {}
// }

class MatchingIssuerBadges {
	constructor(
		public issuerId: string,
		public issuer: ApiRecipientBadgeIssuer,
		public badges: RecipientBadgeInstance[] = []
	) {}

	addBadge(badge: RecipientBadgeInstance) {
		if (badge.issuerId === this.issuerId) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer: ApiRecipientBadgeIssuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return issuer => (
			StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp)
		);
	}

	static badgeMatcher(inputPattern: string): (badge: RecipientBadgeInstance) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return badge => (
			StringMatchingUtil.stringMatches(badge.badgeClass.name, patternStr, patternExp)
		);
	}
}
