import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
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
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { applySorting } from '../../util/sorting';

@Component({
	selector: 'app-badge-catalog',
	templateUrl: './badge-catalog.component.html',
	styleUrls: ['./badge-catalog.component.css'],
	animations: [appearAnimation],
	standalone: false,
})
export class BadgeCatalogComponent extends BaseRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	badges: BadgeClass[] = null;
	badgeResults: BadgeClass[] = null;
	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];

	filteredBadges: BadgeClass[] = null;

	badgesLoaded: Promise<unknown>;

	showLegend = false;
	tags: string[] = [];
	issuers: string[] = [];
	selectedTag: string = null;

	sortControl = new FormControl('');

	groupOptions = [
		{ value: '---', label: 'Nicht gruppieren' },
		{ value: 'issuer', label: 'Institution' },
		{ value: 'category', label: 'Kategorie' },
	];
	groupControl = new FormControl();

	tagsOptions = [];
	tagsControl = new FormControl();

	badgesPerPage = 30;
	totalPages: number;
	nextLink: string;
	previousLink: string;

	sortOption: string | null = null;

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	plural = {
		issuer: {
			'=0': this.translate.instant('Badge.noIssuers'),
			'=1': this.translate.instant('Badge.oneIssuer'),
			other: this.translate.instant('Badge.multiIssuers'),
		},
		badges: {
			'=0': this.translate.instant('Badge.noBadges'),
			'=1': this.translate.instant('Badge.oneBadge'),
			other: this.translate.instant('Badge.multiBadges'),
		},
		recipient: {
			'=0': this.translate.instant('Badge.noRecipients'),
			'=1': this.translate.instant('Badge.oneRecipient'),
			other: this.translate.instant('Badge.multiRecipients'),
		},
	};

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		// this.updateResults();
		this.updatePaginatedResults();
		this.currentPage = 1;
	}

	private _groupBy = '';
	get groupBy() {
		return this._groupBy;
	}
	set groupBy(val: string) {
		this._groupBy = val;
		// this.updateResults();
		this.updatePaginatedResults();
	}

	isFiltered() {
		return Boolean(this.searchQuery || this.tagsControl.value?.length);
	}

	trackById(index: number, item: any): any {
		return item.id;
	}

	private _currentPage = 1;

	get currentPage(): number {
		return this._currentPage;
	}

	set currentPage(value: number) {
		if (this._currentPage !== value) {
			this._currentPage = value;
			this.updatePaginatedResults();
		}
	}

	groups = [this.translate.instant('Badge.category'), this.translate.instant('Badge.issuer'), '---'];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		competency: this.translate.instant('Badge.competency'),
		participation: this.translate.instant('Badge.participation'),
		learningpath: this.translate.instant('Badge.learningpath'),
		noCategory: this.translate.instant('Badge.noCategory'),
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
		title.setTitle(`Badges - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.badgesLoaded = this.loadBadges();

		this.groupControl.valueChanges.subscribe((value) => {
			this.groupBy = value;
		});
	}

	async loadBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				async (badges) => {
					this.badges = badges
						.filter((badge) => badge.issuerVerified && badge.issuerOwnerAcceptedTos)
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

					this.totalPages = Math.ceil(this.badges.length / this.badgesPerPage);
					this.updatePaginatedResults();

					this.badges.forEach((badge) => {
						this.tags = this.tags.concat(badge.tags);
						this.issuers = badge.issuerVerified ? this.issuers.concat(badge.issuer) : this.issuers;
					});

					// sortUnique sorts by frequency, we want to sort by tagname
					// this.tags = sortUnique(this.tags);
					this.tags = this.tags.filter((value, index, array) => array.indexOf(value) === index);
					this.tags.sort();
					this.tags.forEach((t) => {
						this.tagsOptions.push({
							label: t,
							value: t,
						});
					});
					// this.issuers = sortUnique(this.issuers);
					this.issuers = this.issuers.filter((value, index, array) => array.indexOf(value) === index);
					// this.updateResults();
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
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

		// initialize predefined text
		this.prepareTexts();
		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			this.prepareTexts();
		});

		this.tagsControl.valueChanges.subscribe(() => {
			this.updatePaginatedResults();
			this.currentPage = 1;
			// this.updateResults();
		});

		this.sortControl.valueChanges.subscribe((value) => {
			console.log(value);
			this.sortOption = value;
			this.updatePaginatedResults();
			this.currentPage = 1;
		});
	}
	prepareTexts() {
		// 1. Groups
		this.groups = [this.translate.instant('Badge.category'), this.translate.instant('Badge.issuer'), '---'];
		// 2. Category options
		this.categoryOptions = {
			competency: this.translate.instant('Badge.competency'),
			participation: this.translate.instant('Badge.participation'),
			learningpath: this.translate.instant('Badge.learningpath'),
			noCategory: this.translate.instant('Badge.noCategory'),
		};
		// 3. Plural
		this.plural = {
			issuer: {
				'=0': this.translate.instant('Badge.noIssuers'),
				'=1': this.translate.instant('Badge.oneIssuer'),
				other: this.translate.instant('Badge.multiIssuers'),
			},
			badges: {
				'=0': this.translate.instant('Badge.noBadges'),
				'=1': this.translate.instant('Badge.oneBadge'),
				other: this.translate.instant('Badge.multiBadges'),
			},
			recipient: {
				'=0': this.translate.instant('Badge.noRecipients'),
				'=1': this.translate.instant('Badge.oneRecipient'),
				other: this.translate.instant('Badge.multiRecipients'),
			},
		};
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
					'',
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
					'',
				);

				// append result to the categoryResults array bound to the view template.
				that.badgeResultsByCategory.push(categoryResults);
			}

			categoryResults.addBadge(item);

			return true;
		};
		this.badges
			.filter(this.badgeMatcher(this.searchQuery))
			// .filter((badge) => !this.tagsControl.value?.length || this.tagsControl.value.every(tag => badge.tags.includes(tag))) // badges have to match all tags
			.filter(
				(badge) =>
					!this.tagsControl.value?.length || this.tagsControl.value.some((tag) => badge.tags.includes(tag)),
			) // badges have to match at least one tag
			.filter((i) => !i.apiModel.source_url)
			.forEach((item) => {
				that.badgeResults.push(item);
				addBadgeToResultsByIssuer(item);
				addBadgeToResultsByCategory(item);
			});
	}

	private updatePaginatedResults() {
		let that = this;
		this.badgeResults = [];
		this.badgeResultsByIssuer = [];
		const badgeResultsByIssuerLocal = {};
		this.badgeResultsByCategory = [];
		const badgeResultsByCategoryLocal = {};

		const addBadgeToResultsByIssuer = function (item) {
			let issuerResults = badgeResultsByIssuerLocal[item.issuerName];

			if (!issuerResults) {
				issuerResults = badgeResultsByIssuerLocal[item.issuerName] = new MatchingBadgeIssuer(
					item.issuerName,
					'',
				);
				that.badgeResultsByIssuer.push(issuerResults);
			}

			issuerResults.addBadge(item);
			return true;
		};

		const addBadgeToResultsByCategory = function (item) {
			let itemCategory =
				item.extension && item.extension['extensions:CategoryExtension']
					? item.extension['extensions:CategoryExtension'].Category
					: 'noCategory';
			let categoryResults = badgeResultsByCategoryLocal[itemCategory];

			if (!categoryResults) {
				categoryResults = badgeResultsByCategoryLocal[itemCategory] = new MatchingBadgeCategory(
					itemCategory,
					'',
				);
				that.badgeResultsByCategory.push(categoryResults);
			}

			categoryResults.addBadge(item);
			return true;
		};

		this.filteredBadges = this.badges
			.filter(this.badgeMatcher(this.searchQuery))
			.filter(
				(badge) =>
					!this.tagsControl.value?.length || this.tagsControl.value.some((tag) => badge.tags.includes(tag)),
			) // Matches at least one tag
			.filter((i) => !i.apiModel.source_url);

		if (this.sortOption) {
			applySorting(this.filteredBadges, this.sortOption);
		}

		this.totalPages = Math.ceil(this.filteredBadges.length / this.badgesPerPage);
		const start = (this.currentPage - 1) * this.badgesPerPage;
		const end = start + this.badgesPerPage;

		that.badgeResults = this.filteredBadges.slice(start, end);

		// that.badgeResults.forEach((item) => {
		// 	addBadgeToResultsByIssuer(item);
		// 	addBadgeToResultsByCategory(item);
		// });
	}

	// onPageChange(newPage: number) {
	// 	if (newPage >= 1 && newPage <= this.totalPages) {
	// 		this.currentPage = newPage;
	// 		this.updatePaginatedResults();
	// 	}
	// }

	openLegend() {
		this.showLegend = true;
	}

	closeLegend() {
		this.showLegend = false;
	}

	filterByTag(tag) {
		this.selectedTag = this.selectedTag == tag ? null : tag;
		this.updatePaginatedResults();
		// this.updateResults();
	}

	removeTag(tag) {
		this.tagsControl.setValue(this.tagsControl.value.filter((t) => t != tag));
		this.updatePaginatedResults();
		this.currentPage = 1;
	}

	private badgeMatcher(inputPattern: string): (badge) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}
}

class MatchingBadgeIssuer {
	constructor(
		public issuerName: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}

	async addBadge(badge) {
		if (badge.issuerName === this.issuerName) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

export function sortUnique(array: string[]): string[] {
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
	constructor(
		public category: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}

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
