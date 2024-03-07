import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailValidator } from '../../../common/validators/email.validator';
import { UserCredential } from '../../../common/model/user-credential.type';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { FormFieldText } from '../../../common/components/formfield-text';

import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgrApiFailure } from '../../../common/services/api-failure';

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
})
export class LoginComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	
	get theme() {
		return this.configService.theme;
	}
	get api(){
		return this.configService.apiConfig;
	}
	get features() {
		return this.configService.featuresConfig;
	}
	loginForm = typedFormGroup()
		.addControl('username', '', [Validators.required, EmailValidator.validEmail])
		.addControl('password', '', Validators.required)
		.addControl('rememberMe', false);

	verifiedName: string;
	verifiedEmail: string;

	@ViewChild('passwordField')
	passwordField: FormFieldText;

	initFinished: Promise<unknown> = new Promise(() => {});
	loginFinished: Promise<unknown>;

	constructor(
		private fb: FormBuilder,
		private title: Title,
		public sessionService: SessionService,
		private messageService: MessageService,
		private configService: AppConfigService,
		private queryParams: QueryParametersService,
		public oAuthManager: OAuthManager,
		private externalToolsManager: ExternalToolsManager,
		private profileManager: UserProfileManager,
		private sanitizer: DomSanitizer,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route);
		title.setTitle(`Login - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.handleQueryParamCases();
	}

	sanitize(url: string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

	ngOnInit() {
		super.ngOnInit();

		this.initVerifiedData();

		if (this.verifiedEmail) {
			this.loginForm.controls.username.setValue(this.verifiedEmail);
		}
	}

	ngAfterViewInit(): void {
		if (this.verifiedEmail) {
			setTimeout(() => this.passwordField.focus());
		}
	}

	submitAuth() {
		if (!this.loginForm.markTreeDirtyAndValidate()) {
			return;
		}

		const credential: UserCredential = new UserCredential(
			this.loginForm.value.username,
			this.loginForm.value.password
		);

		this.loginFinished = this.sessionService
			.login(credential)
			.then(
				() => {
					this.profileManager.reloadUserProfileSet().then(() => {
						this.profileManager.userProfilePromise.then((profile) => {
							if (profile) {
								// fetch user profile and emails to check if they are verified
								profile.emails.updateList().then(() => {
									if (profile.isVerified) {
										if (this.oAuthManager.isAuthorizationInProgress) {
											this.router.navigate(['/auth/oauth2/authorize']);
										} else {
											this.externalToolsManager.externaltoolsList.updateIfLoaded();
											// catch localStorage.redirectUri
											if (localStorage.redirectUri) {
												const redirectUri = new URL(localStorage.redirectUri);
												localStorage.removeItem('redirectUri');
												window.location.replace(redirectUri.origin);
												return false;
											} else {
												// first time only do welcome
												this.router.navigate([
													localStorage.signup ? 'auth/welcome' : 'recipient',
												]);
											}
										}
									} else {
										this.router.navigate([
											'signup/success',
											{ email: profile.emails.entities[0].email },
										]);
									}
								});
							}
						});
					});
				},
				(response: HttpErrorResponse) =>
					this.messageService.reportHandledError(
						BadgrApiFailure.messageIfThrottableError(response.error) ||
							'Login failed. Please check your email and password and try again.',
						response
					)
			)
			.then(() => (this.loginFinished = null));
	}

	private handleQueryParamCases() {
		try {
			// Handle authcode exchange
			const authCode = this.queryParams.queryStringValue('authCode', true);

			// data
			const redirectUri = localStorage.redirectUri;
			const redirect = 'recipient';
			if (authCode) {
				this.sessionService.exchangeCodeForToken(authCode).then((token) => {
					this.sessionService.storeToken(token);
					this.externalToolsManager.externaltoolsList.updateIfLoaded();
					redirectUri
						? window.location.replace(redirectUri)
						: (this.initFinished = this.router.navigate([redirect]));
				});
				return;
			} else if (this.queryParams.queryStringValue('authToken', true)) {
				this.sessionService.storeToken({
					access_token: this.queryParams.queryStringValue('authToken', true),
				});

				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				redirectUri
					? window.location.replace(redirectUri)
					: (this.initFinished = this.router.navigate([redirect]));
				return;
			} else if (this.queryParams.queryStringValue('infoMessage', true)) {
				this.messageService.reportInfoMessage(this.queryParams.queryStringValue('infoMessage', true), true);
			} else if (this.queryParams.queryStringValue('authError', true)) {
				this.sessionService.logout(false);
				this.messageService.reportHandledError(
					this.queryParams.queryStringValue('authError', true),
					null,
					true
				);
			} else if (this.sessionService.isLoggedIn) {
				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				this.initFinished = this.router.navigate([redirect]);
				return;
			}

			this.initFinished = Promise.resolve(true);

			// autologin, wait till get vars are processed and kick it to the end of the stack
			if (this.sessionService.enabledExternalAuthProviders.length === 1 && this.features.disableRegistration) {
				window.setTimeout(
					() =>
						this.sessionService.initiateUnauthenticatedExternalAuth(
							this.sessionService.enabledExternalAuthProviders[0]
						),
					0
				);
			}
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}

	private initVerifiedData() {
		this.verifiedName = this.queryParams.queryStringValue('name');
		this.verifiedEmail = this.queryParams.queryStringValue('email');
	}
}
