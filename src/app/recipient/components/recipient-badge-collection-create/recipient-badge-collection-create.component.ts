import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ApiRecipientBadgeCollectionForCreation } from '../../models/recipient-badge-collection-api.model';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { typedFormGroup } from '../../../common/util/typed-forms';

@Component({
    selector: 'create-recipient-badge-collection',
    templateUrl: './recipient-badge-collection-create.component.html',
    standalone: false
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	badgeCollectionForm = typedFormGroup()
		.addControl('collectionName', '', [Validators.required, Validators.maxLength(128)])
		.addControl('collectionDescription', '', [Validators.required, Validators.maxLength(255)]);
	createCollectionPromise: Promise<unknown>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private formBuilder: FormBuilder,
		private title: Title,
		private messageService: MessageService,
		private configService: AppConfigService,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager,
	) {
		super(router, route, loginService);

		title.setTitle(`Create Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState: CreateBadgeCollectionForm<string>) {
		if (!this.badgeCollectionForm.markTreeDirtyAndValidate()) {
			return;
		}

		const collectionForCreation: ApiRecipientBadgeCollectionForCreation = {
			name: formState.collectionName,
			description: formState.collectionDescription,
			published: false,
			badges: [],
		};

		this.createCollectionPromise = this.recipientBadgeCollectionManager
			.createRecipientBadgeCollection(collectionForCreation)
			.then(
				(collection) => {
					this.router.navigate(['/recipient/badge-collections/collection', collection.slug]);
					this.messageService.reportMinorSuccess('Collection created successfully.');
				},
				(error) => {
					this.messageService.reportHandledError('Unable to create collection', error);
				},
			)
			.then(() => (this.createCollectionPromise = null));
	}
}

interface CreateBadgeCollectionForm<T> {
	collectionName: T;
	collectionDescription: T;
}
