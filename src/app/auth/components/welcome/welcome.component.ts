import { Component, OnInit } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { AppConfigService } from '../../../common/app-config.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { MessageService } from '../../../common/services/message.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: ['./welcome.component.scss'],
	imports: [RouterLink, TranslatePipe],
})
export class WelcomeComponent /*extends BaseAuthenticatedRoutableComponent*/ implements OnInit {
	constructor(
		private router: Router,
		route: ActivatedRoute,
		private sessionService: SessionService,

		public configService: AppConfigService,
		private queryParams: QueryParametersService,
		private messageService: MessageService,
	) {
		//super(router, route, sessionService);
	}

	ngOnInit() {
		localStorage.removeItem('signup');
		//super.ngOnInit();
		this.handleQueryParamCases();
	}

	initFinished: Promise<unknown> = new Promise(() => {});

	private handleQueryParamCases() {
		try {
			// Handle authcode exchange
			const authCode = this.queryParams.queryStringValue('authCode', true);
			const redirect = 'auth/welcome';
			if (authCode) {
				throw new Error('query param authentication is deprecated!');
			} else if (this.queryParams.queryStringValue('authToken', true)) {
				throw new Error('query param authentication is deprecated!');
			} else if (this.queryParams.queryStringValue('infoMessage', true)) {
				this.messageService.reportInfoMessage(this.queryParams.queryStringValue('infoMessage', true), true);
			} else if (this.queryParams.queryStringValue('authError', true)) {
				this.sessionService.logout();
				this.messageService.reportHandledError(
					this.queryParams.queryStringValue('authError', true),
					null,
					true,
				);
			} else if (this.sessionService.isLoggedIn) {
				this.initFinished = this.router.navigate([redirect]);
				return;
			}

			this.initFinished = Promise.resolve(true);
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}
}
