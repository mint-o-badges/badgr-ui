import { Component, ElementRef, Renderer2 } from '@angular/core';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { BaseDialog } from '../base-dialog';
import { StringMatchingUtil } from '../../util/string-matching-util';
import { groupIntoArray, groupIntoObject } from '../../util/array-reducers';

// TODO: This currently is an (almost) exact copy of the `CopyBadgeDialog`.
// On the long term, there should probably be a base copy dialog or something,
// that unites common features. However, since the copy function is also currently
// being revised, this probably makes more sense after that revision.
/**
 * The dialog used in the badge creation component to fork an existing badge.
 *
 * @see CopyBadgeDialog, since the ForkBadgeDialog started as an (exact) duplicate
 * of this.
 */
@Component({
	selector: 'fork-badge-dialog',
	templateUrl: 'fork-badge-dialog.component.html',
	styleUrls: ['./fork-badge-dialog.component.css'],
})
export class ForkBadgeDialog extends BaseDialog {
	Array = Array;
	resolveFunc: (BadgeClass) => void;
	rejectFunc: () => void;

	badges: BadgeClass[] = null;
	allIssuers: string[] = [];
	badgeResults: BadgeResult[] = null;
	issuerResults: MatchingIssuerBadges[] = [];
	badgeClassesByIssuerId: { [issuerUrl: string]: BadgeClass[] };
	maxDisplayedResults = 100;
	order = 'asc';

	badgesLoaded: Promise<unknown>;

	private _groupByIssuer = false;
	get groupByIssuer() {
		return this._groupByIssuer;
	}
	set groupByIssuer(val: boolean) {
		this._groupByIssuer = val;
		this.updateResults();
	}

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	constructor(
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		componentElem: ElementRef<HTMLElement>,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
	}

	/**
	 * Opens the fork badge dialog, showing it as a modal (@see showModal).
	 *
	 * @param {BadgeClass[]} badges - The badges from which to select one.
	 * @returns a promise, which either resolves to the selected BadgeClass or,
	 * if closed without a selection, undefined.
	 */
	async openDialog(badges: BadgeClass[]): Promise<BadgeClass | void> {
		this.badgesLoaded = new Promise((resolve, reject) => {
			this.badges = badges.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			this.updateBadges(badges);
			resolve(this.badges);
		});
		this.showModal();

		return new Promise<BadgeClass | void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	/**
	 * Closes the dialog, resolving with undefined.
	 */
	closeDialog() {
		this.closeModal();
		this.resolveFunc(undefined);
	}

	/**
	 * Closes the dialog, resolving with the selected badge.
	 *
	 * @param {BadgeClass} badge - The selected badge.
	 */
	forkBadge(badge: BadgeClass) {
		this.closeModal();
		this.resolveFunc(badge);
	}

	/**
	 * Updates the selectable badges.
	 *
	 * @param {BadgeClass[]} allBadges - the selectable badges.
	 */
	private updateBadges(allBadges: BadgeClass[]) {
		this.badgeClassesByIssuerId = allBadges.reduce(
			groupIntoObject<BadgeClass>((b) => b.issuerId),
			{},
		);

		this.allIssuers = allBadges
			.reduce(
				groupIntoArray<BadgeClass, string>((b) => b.issuerName),
				[],
			)
			.map((g) => g.values[0].issuer);

		this.badges = allBadges;

		this.updateResults();
	}

	/**
	 * Updates the filtered badges, i.e. filters the selectable badges and displays them.
	 *
	 * @see MatchingAlgorithm for how the entries are filtered.
	 */
	private updateResults() {
		let that = this;
		// Clear Results
		this.badgeResults = [];
		this.issuerResults.length = 0;

		const issuerResultsByIssuer: { [issuerSlug: string]: MatchingIssuerBadges } = {};

		const addBadgeToResults = (badge: BadgeClass) => {
			// Restrict Length
			if (this.badgeResults.length > this.maxDisplayedResults) {
				return false;
			}

			let issuerResults = issuerResultsByIssuer[badge.issuerSlug];

			if (!issuerResults) {
				issuerResults = issuerResultsByIssuer[badge.issuerSlug] = new MatchingIssuerBadges(
					badge.issuerSlug,
					badge.issuerName,
				);

				// append result to the issuerResults array bound to the view template.
				this.issuerResults.push(issuerResults);
			}

			issuerResults.addBadge(badge);

			if (!this.badgeResults.find((r) => r.badge === badge)) {
				// appending the results to the badgeResults array bound to the view template.
				this.badgeResults.push(new BadgeResult(badge, issuerResults.issuerName));
			}

			return true;
		};

		const addIssuerToResults = (issuer: string) => {
			(this.badgeClassesByIssuerId[issuer] || []).forEach(addBadgeToResults);
		};
		this.allIssuers.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery)).forEach(addIssuerToResults);
		this.badges.filter(MatchingAlgorithm.badgeMatcher(this._searchQuery)).forEach(addBadgeToResults);

		this.badgeResults.sort((a, b) => a.badge.name.localeCompare(b.badge.name));
		this.issuerResults.forEach((r) => r.badges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
	}
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
	) {}
}

/**
 * A collection of badges that has the same issuer.
 */
export class MatchingIssuerBadges {
	constructor(
		public issuerSlug: string,
		public issuerName: string,
		public badges: BadgeClass[] = [],
	) {}

	/**
	 * Add a badge to the collection. This only adds the badge if it has the same issuer
	 * as the collection and isn't already in this collection.
	 *
	 * @param {BadgeClass} badge - the badge to add to the collection.
	 */
	addBadge(badge: BadgeClass) {
		if (badge.issuerSlug === this.issuerSlug) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

/**
 * A matching algorithm for both issuers and badges.
 */
export class MatchingAlgorithm {
	/**
	 * A matcher for issuers.
	 * Matches the issuer string with regular expression passed as a string.
	 *
	 * @param {string} inputPattern - the regular expression to match.
	 * @returns a matcher, returning a boolean for a passed test string.
	 */
	static issuerMatcher(inputPattern: string): (issuer: string) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) => StringMatchingUtil.stringMatches(issuer, patternStr, patternExp);
	}

	/**
	 * A matcher for badges.
	 * Matches the badge name with regular regular expression passed as a string.
	 *
	 * @param {string} inputPattern - the regular expression to match.
	 * @returns a matcher, returning a boolean for a passed badge.
	 */
	static badgeMatcher(inputPattern: string): (badge: BadgeClass) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}
}
