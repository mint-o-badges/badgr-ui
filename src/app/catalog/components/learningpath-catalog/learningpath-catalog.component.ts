import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '../../../common/services/session.service';
import { LearningPathManager } from '../../../issuer/services/learningpath-manager.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { sortUnique } from '../badge-catalog/badge-catalog.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { RecipientBadgeApiService } from '../../../recipient/services/recipient-badges-api.service';
import { appearAnimation } from '../../../common/animations/animations';
import { FormControl, FormsModule } from '@angular/forms';
import { applySorting } from '../../util/sorting';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { NgIf, NgFor } from '@angular/common';
import { CountUpModule } from 'ngx-countup';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { OebGlobalSortSelectComponent } from '../../../components/oeb-global-sort-select.component';
import { BgLearningPathCard } from '../../../common/components/bg-learningpathcard';
import { PaginationAdvancedComponent } from '../../../components/oeb-numbered-pagination';

@Component({
	selector: 'app-learningpaths-catalog',
	templateUrl: './learningpath-catalog.component.html',
	styleUrls: ['../badge-catalog/badge-catalog.component.css'],
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
		BgAwaitPromises,
		HlmH1Directive,
		NgIf,
		CountUpModule,
		FormsModule,
		HlmInputDirective,
		NgIcon,
		HlmIconDirective,
		OebGlobalSortSelectComponent,
		NgFor,
		BgLearningPathCard,
		PaginationAdvancedComponent,
		TranslatePipe,
	],
})
export class LearningPathsCatalogComponent extends BaseRoutableComponent implements OnInit {
	learningPathsLoaded: Promise<unknown>;
	issuersLoaded: Promise<unknown>;
	userBadgesLoaded: Promise<unknown>;
	order = 'asc';
	learningPathResults: LearningPath[] = null;
	filteredMicroDegrees: LearningPath[] = null;
	learningPathResultsByIssuer: MatchingLearningPathIssuer[] = [];
	learningPaths: LearningPath[] = [];
	issuerResults: Issuer[] = [];
	issuersWithLps: string[] = [];
	baseUrl: string;
	tags: string[] = [];
	issuers: Issuer[] = null;
	selectedTag: string = null;
	loggedIn = false;
	userBadges: string[] = [];
	plural = {};
	sortControl = new FormControl();

	microDegreesPerPage = 20;
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

	private _groupByInstitution = false;
	get groupByInstitution() {
		return this._groupByInstitution;
	}
	set groupByInstitution(val: boolean) {
		this._groupByInstitution = val;
		// this.updateResults();
		this.updatePaginatedResults();
	}

	isFiltered() {
		return Boolean(this.searchQuery);
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

	get learningPathPluralWord(): string {
		return this.learningPaths.length === 1
			? this.plural['learningPath']['1']
			: this.plural['learningPath']['other'];
	}

	get issuersPluralWord(): string {
		return this.issuers.length === 1 ? this.plural['issuer']['1'] : this.plural['issuer']['other'];
	}

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected learningPathService: LearningPathManager,
		protected issuerManager: IssuerManager,
		protected sessionService: SessionService,
		protected profileManager: UserProfileManager,
		protected recipientBadgeApiService: RecipientBadgeApiService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
		this.learningPathsLoaded = this.loadLearningPaths();
		this.issuersLoaded = this.loadIssuers();
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	ngOnInit(): void {
		this.loggedIn = this.sessionService.isLoggedIn;

		if (this.loggedIn) {
			this.userBadgesLoaded = this.recipientBadgeApiService.listRecipientBadges().then((badges) => {
				const badgeClassIds = badges.map((b) => b.json.badge.id);
				this.userBadges = badgeClassIds;
			});
		}

		this.prepareTexts();

		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			this.prepareTexts();
		});

		this.sortControl.valueChanges.subscribe((value) => {
			this.sortOption = value;
			this.updatePaginatedResults();
		});
	}

	private learningPathMatcher(inputPattern: string): (lp) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (lp) => StringMatchingUtil.stringMatches(lp.name, patternStr, patternExp);
	}

	private learningPathTagMatcher(tag: string) {
		return (badge) => (tag ? badge.tags.includes(tag) : true);
	}

	prepareTexts() {
		this.plural = {
			issuer: {
				'=0': this.translate.instant('Issuer.noInstitutions'),
				'=1': '1 Institution',
				other: ' ' + this.translate.instant('General.institutions'),
			},
			issuerText: {
				'=0': this.translate.instant('Issuer.institutionsIssued'),
				'=1': '1 ' + this.translate.instant('Issuer.institutionIssued'),
				other: ' ' + this.translate.instant('Issuer.institutionsIssued'),
			},
			learningPath: {
				'=0': this.translate.instant('General.noLearningPaths'),
				'=1': '1 ' + this.translate.instant('General.learningPath'),
				other: ' ' + this.translate.instant('General.learningPaths'),
			},
		};
	}

	changeOrder(order) {
		this.order = order;
		if (this.order === 'asc') {
			this.learningPathResults.sort((a, b) => a.name.localeCompare(b.name));
			this.learningPathResultsByIssuer
				.sort((a, b) => a.issuerName.localeCompare(b.issuerName))
				.forEach((r) => r.learningpaths.sort((a, b) => a.name.localeCompare(b.name)));
		} else {
			this.learningPathResults.sort((a, b) => b.name.localeCompare(a.name));
			this.learningPathResultsByIssuer
				.sort((a, b) => b.issuerName.localeCompare(a.issuerName))
				.forEach((r) => r.learningpaths.sort((a, b) => b.name.localeCompare(a.name)));
		}
	}

	calculateMatch(lp: LearningPath): string {
		const lpBadges = lp.badges;
		const badgeClassIds = lpBadges.map((b) => b.badge.json.id);
		const totalBadges = lpBadges.length;
		const userBadgeCount = badgeClassIds.filter((b) => this.userBadges.includes(b)).length;
		return `${userBadgeCount}/${totalBadges}`;
	}

	calculateLearningPathStatus(lp: LearningPath): { match: string } | { progress: number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress;
			return { progress: percentCompleted };
		} else {
			return { match: this.calculateMatch(lp) };
		}
	}

	checkCompleted(lp: LearningPath): boolean {
		return lp.completed_at != null;
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

	// private updateResults() {
	// 	let that = this;
	// 	// Clear Results
	// 	this.learningPathResults = [];
	// 	this.learningPathResultsByIssuer = [];
	// 	const learningPathResultsByIssuerLocal = {};

	// 	var addLearningPathToResultsByIssuer = function (item) {
	// 		let issuerResults = learningPathResultsByIssuerLocal[item.issuer_name];

	// 		if (!issuerResults) {
	// 			issuerResults = learningPathResultsByIssuerLocal[item.issuer_name] = new MatchingLearningPathIssuer(
	// 				item.issuer_name,
	// 				'',
	// 			);

	// 			// append result to the issuerResults array bound to the view template.
	// 			that.learningPathResultsByIssuer.push(issuerResults);
	// 		}

	// 		issuerResults.addLp(item);

	// 		return true;
	// 	};

	// 	this.learningPaths
	// 		.filter(this.learningPathMatcher(this.searchQuery))
	// 		.filter(this.learningPathTagMatcher(this.selectedTag))
	// 		.forEach((item) => {
	// 			that.learningPathResults.push(item);
	// 			addLearningPathToResultsByIssuer(item);
	// 		});
	// 	this.changeOrder(this.order);
	// }

	private updatePaginatedResults() {
		let that = this;
		this.learningPathResults = [];

		this.filteredMicroDegrees = this.learningPaths
			.filter(this.learningPathMatcher(this.searchQuery))
			.filter(this.learningPathTagMatcher(this.selectedTag));

		if (this.sortOption) {
			applySorting(this.filteredMicroDegrees, this.sortOption);
		}

		this.totalPages = Math.ceil(this.filteredMicroDegrees.length / this.microDegreesPerPage);
		const start = (this.currentPage - 1) * this.microDegreesPerPage;
		const end = start + this.microDegreesPerPage;

		that.learningPathResults = this.filteredMicroDegrees.slice(start, end);
	}

	async loadIssuers() {
		return new Promise(async (resolve, reject) => {
			this.issuerManager.getAllIssuers().subscribe(
				(issuers) => {
					this.issuers = issuers
						.slice()
						.filter((i) => i.apiModel.verified && !i.apiModel.source_url)
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.issuerResults = this.issuers;
					this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));
					resolve(issuers);
				},
				(error) => {
					this.messageService.reportAndThrowError(this.translate.instant('Issuer.failLoadissuers'), error);
				},
			);
		});
	}

	filterByTag(tag) {
		this.selectedTag = this.selectedTag == tag ? null : tag;
		this.updatePaginatedResults();
	}

	async loadLearningPaths() {
		return new Promise(async (resolve, reject) => {
			this.learningPathService.allPublicLearningPaths$.subscribe(
				(lps) => {
					this.learningPaths = lps.filter((lp) => lp.issuerOwnerAcceptedTos);
					lps.forEach((lp) => {
						lp.tags.forEach((tag) => {
							this.tags.push(tag);
						});
						this.issuersWithLps = this.issuersWithLps.concat(lp.issuer_id);
					});
					this.tags = sortUnique(this.tags);
					this.issuersWithLps = sortUnique(this.issuersWithLps);
					this.updatePaginatedResults();
					resolve(lps);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load learningPaths', error);
				},
			);
		});
	}
}

class MatchingAlgorithm {
	static learningPathMatcher(inputPattern: string): (lp) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (lp) => StringMatchingUtil.stringMatches(lp.name, patternStr, patternExp);
	}
}

class MatchingLearningPathIssuer {
	constructor(
		public issuerName: string,
		public learningpath,
		public learningpaths: LearningPath[] = [],
	) {}

	async addLp(learningpath) {
		if (learningpath.issuer_name === this.issuerName) {
			if (this.learningpaths.indexOf(learningpath) < 0) {
				this.learningpaths.push(learningpath);
			}
		}
	}
}
