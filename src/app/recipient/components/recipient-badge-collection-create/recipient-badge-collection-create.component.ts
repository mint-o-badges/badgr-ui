import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';

@Component({
	selector: 'create-recipient-badge-collection',
	templateUrl: './recipient-badge-collection-create.component.html',
	standalone: false,
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	badgeCollectionForm = typedFormGroup()
		.addControl('collectionName', '', [Validators.required, Validators.maxLength(128)])
		.addControl('collectionDescription', '', [Validators.required, Validators.maxLength(255)]);

	createCollectionPromise: Promise<unknown>;
	badgesLoaded: Promise<unknown>;

	private omittedCollection: RecipientBadgeInstance[];

	badges: BadgeClass[] = null;
	selectedBadgeUrls: string[] = [];
	selectedBadges: RecipientBadgeInstance[] = [];
	badgesFormArray: any;

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private title: Title,
		private configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		protected recipientBadgeApiService: RecipientBadgeApiService,
	) {
		super(router, route, loginService);

		title.setTitle(`Create Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}
}
