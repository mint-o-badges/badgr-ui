import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { OAuthBannerComponent } from '../../../common/components/oauth-banner.component';

@Component({
	selector: 'password-reset-sent',
	templateUrl: './reset-password-sent.component.html',
	imports: [FormMessageComponent, OAuthBannerComponent],
})
export class ResetPasswordSent extends BaseRoutableComponent implements OnInit {
	private sessionService = inject(SessionService);
	private configService = inject(AppConfigService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route);
	}

	ngOnInit() {
		if (this.sessionService.isLoggedIn) {
			this.router.navigate(['/auth/userProfile']);
		}
	}

	get helpEmailAddress() {
		return this.configService.helpConfig.email;
	}
}
