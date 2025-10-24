import { Component, inject } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfile } from '../../../common/model/user-profile.model';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { OebInputComponent } from '../../../components/input.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { PasswordComplexityValidator } from '../../../common/validators/password-complexity.validator';
import { HlmH1, HlmP } from '@spartan-ng/helm/typography';

@Component({
	selector: 'change-password',
	templateUrl: './change-password.component.html',
	imports: [
		FormMessageComponent,
		BgBreadcrumbsComponent,
		HlmH1,
		HlmP,
		FormsModule,
		ReactiveFormsModule,
		OebInputComponent,
		OebButtonComponent,
		RouterLink,
		TranslatePipe,
	],
})
export class ChangePasswordComponent extends BaseRoutableComponent {
	private fb = inject(FormBuilder);
	private title = inject(Title);
	private sessionService = inject(SessionService);
	private profileManager = inject(UserProfileManager);
	protected configService = inject(AppConfigService);
	private _messageService = inject(MessageService);
	private translate = inject(TranslateService);

	changePasswordForm = typedFormGroup()
		.addControl('password', '', [
			Validators.required,
			Validators.minLength(8),
			PasswordComplexityValidator.securePassword,
		])
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
	passwordInsecure = this.translate.instant('Profile.passwordInsecure');
	pleaseTryAgain = this.translate.instant('Profile.pleaseTryAgain');

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const route = inject(ActivatedRoute);
		const router = inject(Router);

		super(router, route);
		const title = this.title;

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
							this.passwordInsecure + ' ' + this.pleaseTryAgain,
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
