import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignupModel } from '../../models/signup-model.type';
import { SignupService } from '../../services/signup.service';
import { SessionService } from '../../../common/services/session.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { EmailValidator } from '../../../common/validators/email.validator';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { HttpErrorResponse } from '@angular/common/http';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { CaptchaService } from '../../../common/services/captcha.service';
import { TranslateService } from '@ngx-translate/core';
import 'altcha';

@Component({
	selector: 'sign-up',
	templateUrl: './signup.component.html',
})
export class SignupComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	// Translations
	enterPassword = this.translate.instant('Signup.enterPassword');
	passwordMustBe8Char = this.translate.instant('Signup.passwordMustBe8Char');
	confirmPassword = this.translate.instant('Signup.confirmPassword');
	passwordsNotEqual = this.translate.instant('Signup.passwordsNotEqual');

	baseUrl: string;
	signupForm = typedFormGroup()
		.addControl('username', '', [Validators.required, EmailValidator.validEmail])
		.addControl('firstName', '', Validators.required)
		.addControl('lastName', '', Validators.required)
		.addControl('password', '', [Validators.required, Validators.minLength(8)])
		.addControl('passwordConfirm', '', [Validators.required, this.passwordsMatch.bind(this)])
		.addControl('agreedTermsService', false, Validators.requiredTrue)
		.addControl('marketingOptIn', false)
		.addControl('captcha', '');

	signupFinished: Promise<unknown>;
	captchaVerified = false;

	agreedTermsService = false;

	get theme() {
		return this.configService.theme;
	}

	constructor(
		fb: FormBuilder,
		private title: Title,
		public messageService: MessageService,
		private configService: AppConfigService,
		public sessionService: SessionService,
		public signupService: SignupService,
		public translate: TranslateService,
		public oAuthManager: OAuthManager,
		private sanitizer: DomSanitizer,
		private captchaService: CaptchaService,
		private renderer: Renderer2,
		private elementRef: ElementRef,
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route);
		title.setTitle(`Signup - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	sanitize(url: string) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

	ngOnInit() {
		const scriptElement = this.renderer.createElement('script');
 		scriptElement.src = 'https://sibforms.com/forms/end-form/build/main.js';
  		this.renderer.appendChild(this.elementRef.nativeElement, scriptElement);
		if (this.sessionService.isLoggedIn) {
			this.router.navigate(['/userProfile']);
		}
		const defaultEmail = this.route.snapshot.queryParams['email'];
		if (defaultEmail) this.signupForm.controls.username.setValue(defaultEmail);
	}

	ngAfterViewInit(): void {
		this.captchaService.setupCaptcha('#altcha', (verified) => {
			this.captchaVerified = verified;
		  });
	}

	onSubmit() {
		
		if (!this.signupForm.markTreeDirtyAndValidate()) {
			return;
		}
		
		if(!this.captchaVerified){
			this.messageService.setMessage(this.translate.instant('Captcha.pleaseVerify'), 'error');
			return;
		}
		
		const formState = this.signupForm.value;

		const altcha = <HTMLInputElement>document.getElementsByName('altcha')[0];
		
		const signupUser = new SignupModel(
			formState.username,
			formState.firstName,
			formState.lastName,
			formState.password,
			formState.agreedTermsService,
			formState.marketingOptIn,
			altcha.value,
		);

		this.signupFinished = new Promise<void>((resolve, reject) => {
			const source = this.route.snapshot.params['source'] || localStorage.getItem('source') || null;
			const newsletterSubmitBtn = document.getElementById("newsletter-submit-button") as HTMLButtonElement;
			let brevoError = false
			if(this.signupForm.valid && formState.marketingOptIn){
				newsletterSubmitBtn.click();
				// add small delay to wait if an error message appears
				setTimeout(() => {
					const error = document.querySelector('.entry__error.entry__error--primary');
					const labels = document.querySelectorAll('label');
					const errorLabel = Array.from(labels).find(label => label.textContent.includes('Dieses Feld darf nicht leer sein.'));
					if(errorLabel) {
						brevoError = true
						reject(new Error('Brevo form validation failed'));
					} 
					}, 100); 
			}
			// add delay to wait for brevo error
			setTimeout(() => {
				if(!brevoError){
					this.signupService.submitSignup(signupUser, source).then(
						() => {
							this.sendSignupConfirmation(formState.username);
							resolve();
						},
						(response: HttpErrorResponse) => {
							const error = response.error;
							const throttleMsg = BadgrApiFailure.messageIfThrottableError(error);
		
							if (throttleMsg) {
								this.messageService.reportHandledError(throttleMsg, error);
							} else if (error) {
								if (error.password) {
									this.messageService.setMessage(
										'Your password must be uncommon and at least 8 characters. Please try again.',
										'error',
									);
								} else if (typeof error === 'object' && error.error) {
									this.messageService.setMessage('' + error.error, 'error');
								} else {
									this.messageService.setMessage('' + error, 'error');
								}
							} else {
								this.messageService.setMessage('Unable to signup.', 'error');
							}
							resolve();
						},
					);
				}
				else{
					reject(new Error('Brevo form validation failed'));
				}
			}, 150)
		}).finally(() => (this.signupFinished = null));
	}

	sendSignupConfirmation(email) {
		this.router.navigate(['signup/success', encodeURIComponent(btoa(email))]);
	}

	get showMarketingOptIn() {
		return !!!this.theme['hideMarketingOptIn'];
	}

	passwordsMatch(): ValidationErrors | null {
		if (!this.signupForm) return null;

		const p1 = this.signupForm.controls.password.value;
		const p2 = this.signupForm.controls.passwordConfirm.value;

		if (p1 && p2 && p1 !== p2) {
			return { passwordsMatch: 'Passwords do not match' };
		}

		return null;
	}
}
