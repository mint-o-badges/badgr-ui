import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { MessageService } from '../../../common/services/message.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'signup-success',
	templateUrl: './signup-success.component.html',
})
export class SignupSuccessComponent implements OnInit {
	constructor(
		private routeParams: ActivatedRoute,
		private title: Title,
		private sessionService: SessionService,
		private configService: AppConfigService,
		private router: Router,
		private messageService: MessageService,
		private translate: TranslateService
	) {
		title.setTitle(`Verification - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	email: string;

	ngOnInit() {
		// Ensure the user isn't logged in here, by removing relevant
		// tokens. Don't trigger a change to the loggedInSubject
		// observable though, since the user typically shouldn't
		// be logged in at this point anyway.
		this.sessionService.logout(false);
		this.email = atob(decodeURIComponent(this.routeParams.snapshot.params['email']));
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
		this.sessionService.resendVerificationEmail_unloaggedUser(email).then(
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
					this.messageService.reportAndThrowError(
						this.translate.instant('Signup.resendEmailFailed'),
						err,
					);
				}
			},
		);
	}
}
