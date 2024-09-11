import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { BadgeClassCategory } from '../../../issuer/models/badgeclass-api.model';
import { TranslateService } from '@ngx-translate/core';
import { LearningPathManager } from '../../../issuer/services/learningpath-manager.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { sortUnique } from '../badge-catalog/badge-catalog.component';

@Component({
	selector: 'app-learningpaths-catalog',
	templateUrl: './learningpath-catalog.component.html',
	// styleUrls: ['./learningpaths-catalog.component.css'],
})
export class LearningPathsCatalogComponent extends BaseRoutableComponent implements OnInit {
	learningPathsLoaded: Promise<unknown>;
	issuersLoaded: Promise<unknown>;

	order = 'asc';

	learningPathResults: LearningPath[] = null;
	learningPathResultsByIssuer: MatchingLearningPathIssuer[] = [];


    learningPaths: LearningPath[] = [];

	issuerResults: Issuer[] = [];


	baseUrl: string;

	tags: string[] = [];
	issuers: Issuer[] = null;

	selectedTag: string = null;

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
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
        this.learningPathsLoaded = this.loadLearningPaths();
		this.issuersLoaded = this.loadIssuers();
		this.baseUrl = this.configService.apiConfig.baseUrl;
    }

	private learningPathMatcher(inputPattern: string): (lp) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (lp) => StringMatchingUtil.stringMatches(lp.name, patternStr, patternExp);
	}

	private learningPathTagMatcher(tag: string) {
		return (badge) => (tag ? badge.tags.includes(tag) : true);
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
		this.learningPaths.filter(MatchingAlgorithm.learningPathMatcher(that.searchQuery)).forEach(addLearningPathToResultsByIssuer);

		this.learningPaths
			.filter(this.learningPathMatcher(this.searchQuery))
			.filter(this.learningPathTagMatcher(this.selectedTag))
			.forEach((item) => {
				that.learningPathResults.push(item);
				addLearningPathToResultsByIssuer(item);
			});
		console.log(that.learningPathResults)	
		this.changeOrder(this.order);
	}

	async loadIssuers() {
		let that = this;
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
					});
					this.tags = sortUnique(this.tags);
					resolve(lps);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load learningPaths', error);
				},
        )})
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
