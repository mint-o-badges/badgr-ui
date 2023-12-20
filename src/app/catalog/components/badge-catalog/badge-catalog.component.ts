import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
//import {BadgeClassManager} from '../../services/badgeclass-manager.service';
import { Issuer } from '../../../issuer/models/issuer.model';
//import {BadgeClass} from '../../models/badgeclass.model';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { BadgeClassCategory } from '../../../issuer/models/badgeclass-api.model';

@Component({
	selector: 'app-badge-catalog',
	templateUrl: './badge-catalog.component.html',
	styleUrls: ['./badge-catalog.component.css'],
})
export class BadgeCatalogComponent extends BaseRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg'
	);
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	// issuers: Issuer[] = null;
	badges: BadgeClass[] = null;
	badgeResults: BadgeClass[] = null;
	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	order = 'asc';
	//issuerToBadgeInfo: {[issuerId: string]: IssuerBadgesInfo} = {};

	// issuersLoaded: Promise<unknown>;
	badgesLoaded: Promise<unknown>;

	showLegend = false;
	tags: string[] = [];
	selectedTag: string = null;

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	plural = {
		issuer: {
			'=0': 'No Issuers',
			'=1': '1 Issuer',
			other: '# Issuers',
		},
		badges: {
			'=0': 'No Badges',
			'=1': '1 Badge',
			other: '# Badges',
		},
		recipient: {
			'=0': 'No Recipients',
			'=1': '1 Recipient',
			other: '# Recipients',
		},
	};

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	private _groupBy = 'Category';
	get groupBy() {
		return this._groupBy;
	}
	set groupBy(val: string) {
		this._groupBy = val;
		this.updateResults();
	}
	groups = ['Category', 'Issuer', '---'];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		membership: 'Membership',
		ability: 'Metacompetence',
		archievement: 'Participation/Success',
		skill: 'Professional competence',
		noCategory: 'No category',
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route);
		title.setTitle(`Badges - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.badgesLoaded = this.loadBadges();
	}

	async loadBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				(badges) => {
					this.badges = badges.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.badgeResults = this.badges;
					badges.forEach((badge) => {
						this.tags = this.tags.concat(badge.tags);
					});
					this.tags = sortUnique(this.tags);
					this.updateResults();
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				}
			);
		});
	}

	async getIssuer(badge: BadgeClass): Promise<Issuer> {
		const im = badge.issuerManager;
		const issuer = await im.issuerBySlug(badge.issuerSlug);

		return issuer;
	}

	ngOnInit() {
		super.ngOnInit();
	}

	changeOrder(order) {
		this.order = order;
		if (this.order === 'asc') {
			this.badgeResults.sort((a, b) => a.name.localeCompare(b.name));
			this.badgeResultsByIssuer
				.sort((a, b) => a.issuerName.localeCompare(b.issuerName))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
			this.badgeResultsByCategory
				.sort((a, b) => this.categoryOptions[a.category].localeCompare(this.categoryOptions[b.category]))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
		} else {
			this.badgeResults.sort((a, b) => b.name.localeCompare(a.name));
			this.badgeResultsByIssuer
				.sort((a, b) => b.issuerName.localeCompare(a.issuerName))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
			this.badgeResultsByCategory
				.sort((a, b) => this.categoryOptions[b.category].localeCompare(this.categoryOptions[a.category]))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
		}
	}

	private updateResults() {
		let that = this;
		// Clear Results
		this.badgeResults = [];
		this.badgeResultsByIssuer = [];
		const badgeResultsByIssuerLocal = {};
		this.badgeResultsByCategory = [];
		const badgeResultsByCategoryLocal = {};

		var addBadgeToResultsByIssuer = function (item) {
			let issuerResults = badgeResultsByIssuerLocal[item.issuerName];

			if (!issuerResults) {
				issuerResults = badgeResultsByIssuerLocal[item.issuerName] = new MatchingBadgeIssuer(
					item.issuerName,
					''
				);

				// append result to the issuerResults array bound to the view template.
				that.badgeResultsByIssuer.push(issuerResults);
			}

			issuerResults.addBadge(item);

			return true;
		};
		var addBadgeToResultsByCategory = function (item) {
			let itemCategory =
				item.extension && item.extension['extensions:CategoryExtension']
					? item.extension['extensions:CategoryExtension'].Category
					: 'noCategory';
			let categoryResults = badgeResultsByCategoryLocal[itemCategory];

			if (!categoryResults) {
				categoryResults = badgeResultsByCategoryLocal[itemCategory] = new MatchingBadgeCategory(
					itemCategory,
					''
				);

				// append result to the categoryResults array bound to the view template.
				that.badgeResultsByCategory.push(categoryResults);
			}

			categoryResults.addBadge(item);

			return true;
		};
		this.badges
			.filter(this.badgeMatcher(this.searchQuery))
			.filter(this.badgeTagMatcher(this.selectedTag))
			.filter((i) => !i.apiModel.source_url)
			.forEach((item) => {
				that.badgeResults.push(item);
				addBadgeToResultsByIssuer(item);
				addBadgeToResultsByCategory(item);
			});

		this.changeOrder(this.order);
	}

	openLegend() {
		this.showLegend = true;
	}

	closeLegend() {
		this.showLegend = false;
	}

	filterByTag(tag) {
		this.selectedTag = this.selectedTag == tag ? null : tag;
		this.updateResults();
	}

	private badgeMatcher(inputPattern: string): (badge) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}

	private badgeTagMatcher(tag: string) {
		return (badge) => (tag ? badge.tags.includes(tag) : true);
	}
}

class MatchingBadgeIssuer {
	constructor(public issuerName: string, public badge, public badges: BadgeClass[] = []) {}

	async addBadge(badge) {
		if (badge.issuerName === this.issuerName) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

function sortUnique(array: string[]): string[] {
	let frequency = {};

	array.forEach(function (value) {
		frequency[value] = 0;
	});

	let uniques = array.filter(function (value) {
		return ++frequency[value] == 1;
	});

	return uniques.sort(function (a, b) {
		return frequency[b] - frequency[a];
	});
}

class MatchingBadgeCategory {
	constructor(public category: string, public badge, public badges: BadgeClass[] = []) {}

	async addBadge(badge) {
		if (
			badge.extension &&
			badge.extension['extensions:CategoryExtension'] &&
			badge.extension['extensions:CategoryExtension'].Category === this.category
		) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		} else if (!badge.extension['extensions:CategoryExtension'] && this.category == 'noCategory') {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}
