import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { MessageService } from '../../../common/services/message.service';

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
		this.email = decodeURIComponent(atob(this.routeParams.snapshot.params['email']));
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
				this.messageService.reportMajorSuccess(`A new verification email was sent to: ${email}`);
			},
			(err) => {
				if (err.status === 409) {
					this.messageService.reportAndThrowError(
						'Your email address is already verified. You can login.',
						err,
					);
				} else if (err.status === 429) {
					this.messageService.reportAndThrowError(
						'You have reached a limit for resending verification email. Please check your' +
							' inbox for an existing message or retry after 5 minutes.',
						err,
					);
				} else {
					this.messageService.reportAndThrowError(
						'Failed to resend verification email. Please contact support.',
						err,
					);
				}
			},
		);
	}
}
