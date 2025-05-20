import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';

import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfile } from '../../../common/model/user-profile.model';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { FormFieldText } from '../../../common/components/formfield-text';
import { BadgrButtonComponent } from '../../../common/components/badgr-button.component';

@Component({
    templateUrl: './profile-edit.component.html',
    imports: [
        BgAwaitPromises,
        FormMessageComponent,
        BgBreadcrumbsComponent,
        FormsModule,
        ReactiveFormsModule,
        FormFieldText,
        BadgrButtonComponent,
        RouterLink,
    ],
})
export class ProfileEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	profile: UserProfile;
	profileEditForm = typedFormGroup()
		.addControl('firstName', '', Validators.required)
		.addControl('lastName', '', Validators.required);

	profileLoaded: Promise<unknown>;
	crumbs: LinkEntry[] = [
		{ title: 'Profile', routerLink: ['/profile'] },
		{ title: 'Edit Profile', routerLink: ['/profile/edit'] },
	];

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected profileManager: UserProfileManager,
		protected configService: AppConfigService,
		protected dialogService: CommonDialogsService,
	) {
		super(router, route, sessionService);
		title.setTitle(`Profile - Edit - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.profileLoaded = profileManager.userProfilePromise.then(
			(profile) => (this.profile = profile),
			(error) => this.messageService.reportAndThrowError('Failed to load userProfile', error),
		);

		this.profileLoaded.then(() => this.startEditing());
	}

	startEditing() {
		this.profileEditForm.setValue(this.profile, { emitEvent: false });
	}

	submitEdit() {
		if (!this.profileEditForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formValue = this.profileEditForm.value;

		this.profile.firstName = formValue.firstName;
		this.profile.lastName = formValue.lastName;

		this.profile.save().then(
			() => {
				this.messageService.reportMinorSuccess(`Saved profile changes`);
				this.router.navigate(['/profile/profile']);
			},
			(error) => {
				this.messageService.reportHandledError(`Failed save profile changes`, error);
			},
		);
	}
}
