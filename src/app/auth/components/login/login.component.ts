import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmailValidator } from '../../../common/validators/email.validator';
import { UserCredential } from '../../../common/model/user-credential.type';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { FormFieldText } from '../../../common/components/formfield-text';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { UserProfileApiService } from '../../../common/services/user-profile-api.service';
import { OebInputComponent } from '../../../components/input.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmP } from '@spartan-ng/helm/typography';
import { OebHeaderText } from '~/components/oeb-header-text.component';

interface RedirectResponse {
	success: boolean;
	redirectPath: string;
}

type RedirectHttpResponse = HttpResponse<RedirectResponse>;

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	imports: [
		HlmP,
		RouterLink,
		FormsModule,
		OebInputComponent,
		OebCheckboxComponent,
		OebButtonComponent,
		FormMessageComponent,
		TranslatePipe,
		OebHeaderText,
	],
})
export class LoginComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	private fb = inject(FormBuilder);
	private title = inject(Title);
	sessionService = inject(SessionService);
	private messageService = inject(MessageService);
	private configService = inject(AppConfigService);
	private queryParams = inject(QueryParametersService);
	oAuthManager = inject(OAuthManager);
	private profileManager = inject(UserProfileManager);
	private userProfileApiService = inject(UserProfileApiService);
	private sanitizer = inject(DomSanitizer);
	private http = inject(HttpClient);
	private translate = inject(TranslateService);

	get theme() {
		return this.configService.theme;
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
	baseUrl: string;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route);
		const title = this.title;

		title.setTitle(`Login - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.handleQueryParamCases();
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	sanitize(url: string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

	ngOnInit() {
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

	afterLogin() {
		this.profileManager.reloadUserProfileSet().then(() => {
			this.profileManager.userProfilePromise.then((profile) => {
				if (profile) {
					// fetch user profile and emails to check if they are verified
					profile.emails.updateList().then(() => {
						if (profile.isVerified) {
							if (this.oAuthManager.isAuthorizationInProgress) {
								this.router.navigate(['/auth/oauth2/authorize']);
							} else {
								this.userProfileApiService
									.getRedirectUrl()
									.then((response: RedirectHttpResponse) => {
										if (response.body.success && response.body.redirectPath) {
											this.router.navigateByUrl(response.body.redirectPath);
										} else {
											this.router.navigate([localStorage.signup ? 'auth/welcome' : 'issuer']);
										}
									})
									.catch(() => this.router.navigate(['/public/start']));

								// this.http.post<{success: boolean, redirectPath: string}>(`${this.baseUrl}/v1/user/get-redirect-path`, {}, {withCredentials: true})
								// .subscribe({
								//   next: (response) => {
								// 	if (response.success && response.redirectPath) {
								// 	  this.router.navigateByUrl(response.redirectPath);
								// 	} else {
								// 	  this.router.navigate([localStorage.signup ? 'auth/welcome' : 'issuer',]);
								// 	}
								//   },
								//   error: () => this.router.navigate(['/public/start'])
								// });
							}
						} else {
							this.router.navigate([
								'signup/success',
								encodeURIComponent(btoa(profile.emails.entities[0].email)),
							]);
						}
					});
				}
			});
		});
	}

	validateToken() {
		this.loginFinished = this.sessionService
			.validateToken()
			.then(
				() => this.afterLogin(),
				(response: HttpErrorResponse) => {
					if (response.status == 401) {
						// Unauthorized: The user is not
						// authenticated in Django, meaning that the
						// OIDC authentication failed. The user
						// probably already knows this at this point
						this.router.navigate([], {
							queryParams: { validateToken: null },
							queryParamsHandling: 'merge',
						});
						// Don't display an error, since it might happen
						// quite easily that the user navigates to the
						// address containing ?validateToken
						console.error(
							'Token validation failed. This means',
							'that either the user accidently',
							'navigated to the address with the',
							'?validateToken query parameter, or',
							'something weird happened',
						);
					} else {
						this.messageService.reportHandledError(
							BadgrApiFailure.messageIfThrottableError(response.error) ||
								this.translate.instant('Login.failLogin'),
							response,
						);
					}
				},
			)
			.then(() => (this.loginFinished = null));
	}

	bildungsraumLogin() {
		if (this.isOidcDisabled()) return;
		const endpoint = this.sessionService.baseUrl + '/oidc/authenticate';
		window.location.href = endpoint;
	}

	submitAuth() {
		if (!this.loginForm.markTreeDirtyAndValidate()) {
			return;
		}

		const credential: UserCredential = new UserCredential(
			this.loginForm.value.username,
			this.loginForm.value.password,
		);

		this.loginFinished = this.sessionService
			.login(credential)
			.then(
				() => this.afterLogin(),
				(response: HttpErrorResponse) =>
					this.messageService.reportHandledError(
						BadgrApiFailure.messageIfThrottableError(response.error) ||
							this.translate.instant('Login.failLogin'),
						response,
					),
			)
			.then(() => (this.loginFinished = null));
	}

	private handleQueryParamCases() {
		this.route.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('validateToken')) this.validateToken();
		});

		try {
			// Handle authcode exchange
			const authCode = this.queryParams.queryStringValue('authCode', true);

			if (authCode) {
				throw new Error('query param authentication is deprecated!');
			}
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}

	private initVerifiedData() {
		this.verifiedName = this.queryParams.queryStringValue('name');
		this.verifiedEmail = this.queryParams.queryStringValue('email');
	}

	isOidcDisabled(): boolean {
		// Currently, OIDC is disabled in all environments
		//const prodUrl = 'https://openbadges.education';
		//return location.origin === prodUrl;
		return true;
	}
}
