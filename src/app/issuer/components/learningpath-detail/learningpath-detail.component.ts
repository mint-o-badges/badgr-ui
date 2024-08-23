import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { LearningPath } from '../../models/learningpath.model';
import { LearningPathManager } from '../../services/learningpath-manager.service';

@Component({
	selector: 'issuer-detail',
	templateUrl: './issuer-detail.component.html',
})
export class LearningPathDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	learningPath: LearningPath;
    learningPathSlug: string;


    learningPathLoaded: Promise<unknown>;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
        protected learningPathManager: LearningPathManager,
		protected learningPathsService: LearningPathApiService,
		private configService: AppConfigService,
	) {
		super(router, route, loginService);

		title.setTitle(`LearningPath Detail - ${this.configService.theme['serviceName'] || 'Badgr'}`);

        this.learningPathSlug = this.route.snapshot.params['learningPathSlug'];

        this.learningPathLoaded = this.learningPathManager.learningPathBySlug(this.learningPathSlug).then(
            (learningPath) => {
                console.log(learningPath)
            }
        );
	}

	ngOnInit() {
		super.ngOnInit();
	}
}
