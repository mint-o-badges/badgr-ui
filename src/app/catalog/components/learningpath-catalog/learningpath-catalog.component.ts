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

@Component({
	selector: 'app-learningpaths-catalog',
	templateUrl: './learningpath-catalog.component.html',
	// styleUrls: ['./learningpaths-catalog.component.css'],
})
export class LearningPathsCatalogComponent extends BaseRoutableComponent implements OnInit {
	learningPathsLoaded: Promise<unknown>;

    learningPaths: LearningPath[] = [];

	tags: string[] = [];
	issuers: string[] = [];
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
		// this.updateResults();
	}

	private _groupBy = '---';
	get groupBy() {
		return this._groupBy;
	}
	set groupBy(val: string) {
		this._groupBy = val;
		// this.updateResults();
	}

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected learningPathService: LearningPathManager,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
        this.learningPathsLoaded = this.loadLearningPaths();
    }

    async loadLearningPaths() { 
        return new Promise(async (resolve, reject) => {
            this.learningPathService.allPublicLearningPaths$.subscribe(
				(lps) => {
					this.learningPaths = lps
					resolve(lps);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
        )})
    }
}