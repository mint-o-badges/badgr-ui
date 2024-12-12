import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { BadgeClassCategory } from '../../../issuer/models/badgeclass-api.model';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../../common/services/session.service';
import { LearningPathManager } from '../../../issuer/services/learningpath-manager.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { sortUnique } from '../badge-catalog/badge-catalog.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { RecipientBadgeApiService } from '../../../recipient/services/recipient-badges-api.service';
import { ApiRecipientBadgeInstance } from '../../../recipient/models/recipient-badge-api.model';
import { appearAnimation } from '../../../common/animations/animations';

@Component({
	selector: 'app-learningpaths-catalog',
	templateUrl: './learningpath-catalog.component.html',
	styleUrls: ['../badge-catalog/badge-catalog.component.css'],
	animations: [appearAnimation]
})
export class LearningPathsCatalogComponent extends BaseRoutableComponent implements OnInit {
	learningPathsLoaded: Promise<unknown>;
	issuersLoaded: Promise<unknown>;
	userBadgesLoaded: Promise<unknown>;
	order = 'asc';
	learningPathResults: LearningPath[] = null;
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
		this.updateResults();
	}

	private _groupByInstitution = false;
	get groupByInstitution() {
		return this._groupByInstitution;
	}
	set groupByInstitution(val: boolean) {
		this._groupByInstitution = val;
		this.updateResults();
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
			})
		}

		this.prepareTexts();

		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			this.prepareTexts();
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
				other: '# ' + this.translate.instant('General.institutions'),
			},
			issuerText: {
				'=0': this.translate.instant('Issuer.institutionsIssued'),
				'=1': '1 ' + this.translate.instant('Issuer.institutionIssued'),
				other: '# ' + this.translate.instant('Issuer.institutionsIssued'),
			},
			learningPath: {
				'=0': this.translate.instant('General.noLearningPaths'),
				'=1': '1 ' + this.translate.instant('General.learningPath'),
				other: '# ' + this.translate.instant('General.learningPaths'),
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

	calculateLearningPathStatus(lp: LearningPath): { 'match': string } | { 'progress': number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress
			return { 'progress': percentCompleted }
		}
		else {
			return { 'match': this.calculateMatch(lp) }
		}
	}

	checkCompleted(lp: LearningPath): boolean {
		return lp.completed_at != null;
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce((acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad, 0);
		return totalStudyLoad;
	}

	private updateResults() {
		let that = this;
		// Clear Results
		this.learningPathResults = [];
		this.learningPathResultsByIssuer = [];
		const learningPathResultsByIssuerLocal = {};

		var addLearningPathToResultsByIssuer = function (item) {
			let issuerResults = learningPathResultsByIssuerLocal[item.issuer_name];

			if (!issuerResults) {
				issuerResults = learningPathResultsByIssuerLocal[item.issuer_name] = new MatchingLearningPathIssuer(
					item.issuer_name,
					'',
				);

				// append result to the issuerResults array bound to the view template.
				that.learningPathResultsByIssuer.push(issuerResults);
			}

			issuerResults.addLp(item);

			return true;
		};

		this.learningPaths
			.filter(this.learningPathMatcher(this.searchQuery))
			.filter(this.learningPathTagMatcher(this.selectedTag))
			.forEach((item) => {
				that.learningPathResults.push(item);
				addLearningPathToResultsByIssuer(item);
			});
		this.changeOrder(this.order);
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
		this.updateResults();
	}

	async loadLearningPaths() {
		return new Promise(async (resolve, reject) => {
			this.learningPathService.allPublicLearningPaths$.subscribe(
				(lps) => {
					this.learningPaths = lps
					lps.forEach((lp) => {
						lp.tags.forEach((tag) => {
							this.tags.push(tag);
						})
						this.issuersWithLps = this.issuersWithLps.concat(lp.issuer_id)
					});
					this.tags = sortUnique(this.tags);
					this.issuersWithLps = sortUnique(this.issuersWithLps);
					this.updateResults();
					resolve(lps);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load learningPaths', error);
				},
			)
		})
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
	) {
	}

	async addLp(learningpath) {
		if (learningpath.issuer_name === this.issuerName) {
			if (this.learningpaths.indexOf(learningpath) < 0) {
				this.learningpaths.push(learningpath);
			}
		}
	}
}
