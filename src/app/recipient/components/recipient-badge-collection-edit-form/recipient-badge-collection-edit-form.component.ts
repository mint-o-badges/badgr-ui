import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { NgIf } from '@angular/common';
import { FormFieldText } from '../../../common/components/formfield-text';
import { BadgrButtonComponent } from '../../../common/components/badgr-button.component';

@Component({
    selector: 'recipient-badge-collection-edit-form',
    templateUrl: './recipient-badge-collection-edit-form.component.html',
    imports: [
        FormMessageComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        FormFieldText,
        BadgrButtonComponent,
    ],
})
export class RecipientBadgeCollectionEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	@Input() badgeCollection: RecipientBadgeCollection;

	badgeCollectionForm = typedFormGroup()
		.addControl('collectionName', '', [Validators.required, Validators.maxLength(128)])
		.addControl('collectionDescription', '', [Validators.required, Validators.maxLength(255)]);

	savePromise: Promise<unknown>;

	isEditing = false;

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
	}

	ngOnInit() {
		super.ngOnInit();
	}

	startEditing() {
		this.isEditing = true;

		this.badgeCollectionForm.controls.collectionName.setValue(this.badgeCollection.name, { emitEvent: false });
		this.badgeCollectionForm.controls.collectionDescription.setValue(this.badgeCollection.description, {
			emitEvent: false,
		});
	}

	cancelEditing() {
		this.isEditing = false;
	}

	onSubmit() {
		if (!this.badgeCollectionForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.badgeCollectionForm.value;

		if (this.badgeCollectionForm.valid) {
			this.badgeCollection.name = formState.collectionName;
			this.badgeCollection.description = formState.collectionDescription;

			this.savePromise = this.badgeCollection
				.save()
				.then(
					(success) => {
						this.isEditing = false;
						this.messageService.reportMinorSuccess(
							`Saved changes to collection ${this.badgeCollection.name}`,
						);
					},
					(failure) =>
						this.messageService.reportHandledError(
							`Failed to save changes to collection ${this.badgeCollection.name}`,
						),
				)
				.then(() => (this.savePromise = null));
		}
	}
}
