import { Component, OnInit } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { AppConfigService } from '../../../common/app-config.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { MessageService } from '../../../common/services/message.service';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent /*extends BaseAuthenticatedRoutableComponent*/ implements OnInit {
	constructor(
		private router: Router,
		route: ActivatedRoute,
		private sessionService: SessionService,

		public configService: AppConfigService,
		private queryParams: QueryParametersService,
		private externalToolsManager: ExternalToolsManager,
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
				this.sessionService
					.exchangeCodeForToken(authCode)
					.then((token) => {
						this.sessionService.storeToken(token);
						this.externalToolsManager.externaltoolsList.updateIfLoaded();
						// we're already here!
						this.initFinished = this.router.navigate([redirect]);
					})
					.catch((error) => {
						this.sessionService.logout();
						this.messageService.reportHandledError(error.error.error, null, true);
						this.initFinished = this.router.navigate(['login']);
					});
				return;
			} else if (this.queryParams.queryStringValue('authToken', true)) {
				this.sessionService.storeToken({
					access_token: this.queryParams.queryStringValue('authToken', true),
				});

				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				this.initFinished = this.router.navigate([redirect]);
				return;
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
				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				this.initFinished = this.router.navigate([redirect]);
				return;
			}

			this.initFinished = Promise.resolve(true);
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}
}
