import { Component } from '@angular/core';

import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfile } from '../../../common/model/user-profile.model';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'change-password',
	templateUrl: './change-password.component.html',
	standalone: false,
})
export class ChangePasswordComponent extends BaseRoutableComponent {
	changePasswordForm = typedFormGroup()
		.addControl('password', '', [Validators.required, Validators.minLength(8)])
		.addControl('password2', '', [Validators.required, this.passwordsMatch.bind(this)])
		.addControl('current_password', '', [Validators.required]);

	profile: UserProfile;
	errors = {
		current_password: '',
		password: '',
	};
	crumbs: LinkEntry[] = [
		{ title: 'Profile', routerLink: ['/profile'] },
		{ title: 'Change Password', routerLink: ['/profile/change-password'] },
	];

	// Translations
	enterYourNewPassword = this.translate.instant('Profile.enterYourNewPassword');
	mustBe8Char = this.translate.instant('Profile.mustBe8Char');
	confirmNewPassword = this.translate.instant('Profile.confirmNewPassword');
	enterNewPasswordConfirmation = this.translate.instant('Profile.enterNewPasswordConfirmation');
	PasswordsDoNotMatch = this.translate.instant('Profile.PasswordsNotMatch');

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		private profileManager: UserProfileManager,
		route: ActivatedRoute,
		router: Router,
		protected configService: AppConfigService,
		private _messageService: MessageService,
		private translate: TranslateService,
	) {
		super(router, route);

		title.setTitle(`Change Password - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.profileManager.userProfilePromise.then((profile) => (this.profile = profile));
	}

	isJson = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	submitChange() {
		if (!this.changePasswordForm.markTreeDirtyAndValidate()) {
			return;
		}

		this.profile
			.updatePassword(this.changePasswordForm.value.password, this.changePasswordForm.value.current_password)
			.then(
				() => {
					this._messageService.reportMajorSuccess('Your password has been changed successfully.', true);
					this.router.navigate(['/profile/profile']);
				},
				(err) => {
					if (err.message && this.isJson(err.message)) {
						const errors = JSON.parse(err.message);
						for (const key in errors) {
							if (errors.hasOwnProperty(key)) {
								this.errors[key] = errors[key];
								const c = this.changePasswordForm.controls[key].rawControl.valueChanges.subscribe(
									(val) => {
										if (this.changePasswordForm.value[key] === val) return;
										this.errors[key] = '';
										c.unsubscribe();
									},
								);
							}
						}
					} else {
						this._messageService.reportAndThrowError(
							'Your password must be uncommon and at least 8 characters. Please try again.',
							err,
						);
					}
				},
			);
	}

	forgotPassword() {
		this.sessionService.logout();
		this.router.navigate(['/auth/request-password-reset']);
	}

	passwordsMatch(): ValidationErrors | null {
		if (!this.changePasswordForm) return null;

		const p1 = this.changePasswordForm.controls.password.value;
		const p2 = this.changePasswordForm.controls.password2.value;

		if (p1 && p2 && p1 !== p2) {
			return { passwordsMatch: 'Passwords do not match' };
		}

		return null;
	}
}
