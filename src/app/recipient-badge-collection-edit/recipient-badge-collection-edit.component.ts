import { Component, OnInit } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../common/pages/base-authenticated-routable.component';
import { SessionService } from '../common/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../common/services/message.service';
import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
import { RecipientBadgeCollectionManager } from '../recipient/services/recipient-badge-collection-manager.service';
import { RecipientBadgeCollection } from '../recipient/models/recipient-badge-collection.model';
import { AppConfigService } from '../common/app-config.service';
import { HlmH1Directive } from '../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { RecipientBadgeCollectionEditFormComponent } from '../recipient/components/recipient-badge-collection-edit-form/recipient-badge-collection-edit-form.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'edit-recipient-badge-collection',
	templateUrl: './recipient-badge-collection-edit.component.html',
	imports: [HlmH1Directive, RecipientBadgeCollectionEditFormComponent, TranslatePipe],
})
export class RecipientBadgeCollectionEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	collectionLoaded: Promise<unknown>;
	collection: RecipientBadgeCollection;
	slug: string;

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected title: Title,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager,
		protected collectionManager: RecipientBadgeCollectionManager,
		private configService: AppConfigService,
	) {
		super(router, route, sessionService);

		this.slug = this.route.snapshot.params['collectionSlug'];

		this.collectionLoaded = this.collectionManager.recipientBadgeCollectionList.loadedPromise.then(
			(collection) => {
				this.collection = collection.entityForSlug(this.slug);
			},
			(error) => {
				this.messageService.reportLoadingError(`Cannot find badge ${this.slug}`, error);
			},
		);

		title.setTitle(`Edit Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	ngOnInit() {
		super.ngOnInit();
	}
}
