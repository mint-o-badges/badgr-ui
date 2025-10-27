import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { MessageService } from '../../../common/services/message.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { OAuthBannerComponent } from '../../../common/components/oauth-banner.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
	selector: 'signup-success',
	templateUrl: './signup-success.component.html',
	providers: [provideIcons({ lucideCheck })],
	imports: [FormMessageComponent, OAuthBannerComponent, NgIcon, HlmIcon, OebButtonComponent, TranslatePipe],
})
export class SignupSuccessComponent implements OnInit {
	private routeParams = inject(ActivatedRoute);
	private title = inject(Title);
	private sessionService = inject(SessionService);
	private configService = inject(AppConfigService);
	private router = inject(Router);
	private messageService = inject(MessageService);
	private translate = inject(TranslateService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const title = this.title;

		title.setTitle(`Verification - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	email: string;
	signedUpForNewsletter: boolean;

	ngOnInit() {
		this.email = atob(decodeURIComponent(this.routeParams.snapshot.params['email']));
		this.signedUpForNewsletter = this.routeParams.snapshot.queryParamMap.has('signedUpForNewsletter')
			? this.routeParams.snapshot.queryParamMap.get('signedUpForNewsletter') === 'true'
			: false;
	}

	get helpEmailUrl() {
		return `mailto:${
			this.configService.helpConfig ? this.configService.helpConfig.email : 'info@openbadges.education'
		}`;
	}
	get service() {
		return this.configService.theme['serviceName'] || 'Badgr';
	}

	resendVerificatoinEmail(email: string) {
		this.sessionService.resendVerificationEmail_unloggedUser(email).then(
			() => {
				this.messageService.reportMajorSuccess(this.translate.instant('Signup.newEmailSent') + email);
			},
			(err) => {
				if (err.status === 409) {
					this.messageService.reportAndThrowError(
						this.translate.instant('Signup.emailAlreadyConfirmed'),
						err,
					);
				} else if (err.status === 429) {
					this.messageService.reportAndThrowError(
						this.translate.instant('Signup.reachedResendEmailLimit'),
						err,
					);
				} else {
					this.messageService.reportAndThrowError(this.translate.instant('Signup.resendEmailFailed'), err);
				}
			},
		);
	}
}
