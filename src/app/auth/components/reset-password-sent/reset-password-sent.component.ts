import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';

@Component({
    selector: 'password-reset-sent',
    templateUrl: './reset-password-sent.component.html',
    standalone: false
})
export class ResetPasswordSent extends BaseRoutableComponent {
	constructor(
		private sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private configService: AppConfigService,
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		if (this.sessionService.isLoggedIn) {
			this.router.navigate(['/auth/userProfile']);
		}
	}

	get helpEmailAddress() {
		return this.configService.helpConfig.email;
	}
}
