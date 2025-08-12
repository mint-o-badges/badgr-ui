import { Component } from '@angular/core';

import { FormBuilder, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LangChangeEvent, TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { OAuthBannerComponent } from '../../../common/components/oauth-banner.component';
import { HlmH1 } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { OebInputComponent } from '../../../components/input.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { PasswordComplexityValidator } from '../../../common/validators/password-complexity.validator';
import { UserProfile } from '../../../common/model/user-profile.model';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { map, startWith } from 'rxjs';

@Component({
	selector: 'new-password',
	templateUrl: './new-password.component.html',
	imports: [
		FormMessageComponent,
		OAuthBannerComponent,
		HlmH1,
		FormsModule,
		ReactiveFormsModule,
		OebInputComponent,
		OebButtonComponent,
		RouterLink,
		TranslatePipe,
	],
})
export class NewPasswordComponent extends BaseRoutableComponent {
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
	// Translation
	enterNewPassword;
	mustBe8Char;
	enterNewPasswordConfirmation;
	passwordsDoNotMatch;
	passwordInsecure;
	pleaseTryAgain;

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		route: ActivatedRoute,
		router: Router,
		private configService: AppConfigService,
		private _messageService: MessageService,
		public translate: TranslateService,
		private profileManager: UserProfileManager,
	) {
		super(router, route);

		title.setTitle(`New Password - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.profileManager.userProfilePromise.then((profile) => (this.profile = profile));
	}

	ngOnInit() {
		super.ngOnInit();

		// To resolve the issue of translation bug when opening a page direclty via link. In this case sent via email.
		this.translate.onLangChange
			.pipe(
				map((ev: LangChangeEvent) => ev.lang),
				startWith(this.translate.currentLang),
			)
			.subscribe(() => {
				this.enterNewPassword = this.translate.instant('Login.enterNewPassword');
				this.mustBe8Char = this.translate.instant('Login.mustBe8Char');
				this.enterNewPasswordConfirmation = this.translate.instant('Login.enterNewPasswordConfirmation');
				this.passwordsDoNotMatch = this.translate.instant('Login.passwordsNotMatch');
				this.passwordInsecure = this.translate.instant('Profile.passwordInsecure');
				this.pleaseTryAgain = this.translate.instant('Profile.pleaseTryAgain');
			});
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
