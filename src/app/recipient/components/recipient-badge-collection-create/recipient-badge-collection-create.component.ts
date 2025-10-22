import { Component, OnInit, inject } from '@angular/core';
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
import { RecipientBadgeCollectionEditFormComponent } from '../recipient-badge-collection-edit-form/recipient-badge-collection-edit-form.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmH1 } from '@spartan-ng/helm/typography';

@Component({
	selector: 'create-recipient-badge-collection',
	templateUrl: './recipient-badge-collection-create.component.html',
	imports: [HlmH1, RecipientBadgeCollectionEditFormComponent, TranslatePipe],
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	private title = inject(Title);
	private configService = inject(AppConfigService);
	protected badgeClassService = inject(BadgeClassManager);
	protected recipientBadgeApiService = inject(RecipientBadgeApiService);

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

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = inject(Router);
		const route = inject(ActivatedRoute);
		const loginService = inject(SessionService);

		super(router, route, loginService);
		const title = this.title;


		title.setTitle(`Create Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}
}
