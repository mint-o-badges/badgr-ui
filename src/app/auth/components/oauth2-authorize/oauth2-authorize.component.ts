import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { AuthAttemptResult, OAuthManager } from '../../../common/services/oauth-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { MessageService } from '../../../common/services/message.service';
import { OAuth2RequestParams } from '../../../common/model/oauth-api.model';
import { throwExpr } from '../../../common/util/throw-expr';
import { Title } from '@angular/platform-browser';
import { InitialLoadingIndicatorService } from '../../../common/services/initial-loading-indicator.service';
import { AppConfigService } from '../../../common/app-config.service';

@Component({
    // selector: 'logout',
    templateUrl: './oauth2-authorize.component.html',
    standalone: false
})
export class OAuth2AuthorizeComponent extends BaseRoutableComponent {
	readonly authLinkLogoSrc = this.theme.logoImg.small;

	_loadingPromise: Promise<unknown> | null = null;
	set loadingPromise(promise: Promise<unknown> | null) {
		this._loadingPromise = promise;
		this.initialLoadingIndicatorService.initialLoadedPromise = promise || Promise.resolve();
	}

	get loadingPromise() {
		return this._loadingPromise;
	}

	get theme() {
		return this.configService.theme;
	}

	iconName(scopeCssName: string): string {
		if (scopeCssName === 'permission-issuer') return 'issuer2';
		if (scopeCssName === 'permission-assertion') return 'badgeaward';
		if (scopeCssName === 'permission-profile') return 'email';
		return 'checkmark';
	}

	constructor(
		router: Router,
		route: ActivatedRoute,
		private title: Title,
		protected messageService: MessageService,
		protected loginService: SessionService,
		protected oAuthManager: OAuthManager,
		protected queryParams: QueryParametersService,
		private configService: AppConfigService,
		protected initialLoadingIndicatorService: InitialLoadingIndicatorService,
	) {
		super(router, route);
		title.setTitle(`Authorize - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	get authorizingApp() {
		return this.oAuthManager.currentAuthorization;
	}

	get presentationScopes() {
		return this.authorizingApp && this.oAuthManager.presentationScopesForScopes(this.authorizingApp.scopes);
	}

	cancelAuthorization() {
		this.oAuthManager.cancelCurrentAuthorization();
	}

	authorizeApp() {
		this.oAuthManager
			.authorizeCurrentApp()
			.catch((error) =>
				this.messageService.reportAndThrowError(
					'Failed to Authorize ' + this.authorizingApp.application.name,
					error,
				),
			);
	}

	ngOnInit() {
		super.ngOnInit();

		const clientIdParam = this.queryParams.queryStringValue('client_id');

		if (clientIdParam) {
			this.loadingPromise = Promise.resolve()
				.then(() => {
					// Disabled this check because pathways include this. The check was previously ineffective due to a bug, and as such, pathways
					// never needed to send this. It should be re-enabled after all applications that authenticate using badgr-ui are validated as
					// sending this.
					// if (this.queryParams.queryStringValue("response_type") !== "code") {
					// 	throw new Error("Only response_type='code' is supported");
					// }

					const request: OAuth2RequestParams = {
						clientId: clientIdParam || throwExpr('client_id param missing'),
						redirectUrl:
							this.queryParams.queryStringValue('redirect_uri') ||
							throwExpr('redirect_uri param missing'),
						scopeString: this.queryParams.queryStringValue('scope') || null,
						stateString: this.queryParams.queryStringValue('state') || null,
					};

					return this.oAuthManager.startOAuth2Authorization(request).then((state) => {
						if (state === AuthAttemptResult.AUTHORIZATION_REQUIRED) {
							this.title.setTitle(
								`Authorize ${this.authorizingApp.application.name} - ${
									this.configService.theme['serviceName'] || 'Badgr'
								}`,
							);
							// We'll stay on this page to perform the authorization
						} else if (state === AuthAttemptResult.LOGIN_REQUIRED) {
							return this.router.navigate(['/auth/login']);
						} else if (state === AuthAttemptResult.SUCCESS) {
							// Do nothing. The service will have navigated us to the OAuth2 consumer
							// Prevent the initial loading indicator from disappearing so there isn't strange flashing of the UI
							this.initialLoadingIndicatorService.initialLoadedPromise = new Promise(() => {});
						}
					});
				})
				.catch((error) =>
					this.messageService.reportAndThrowError(
						'Invalid OAuth2 Request. Please contact technical support.',
						error,
					),
				);
		} else if (this.oAuthManager.isAuthorizationInProgress) {
			// We're already performing an authorization... nothing to do
		} else {
			// We aren't in an authorization and we weren't given params. Error.
			this.loadingPromise = Promise.resolve().then(() =>
				this.messageService.reportAndThrowError(
					'Invalid OAuth2 Request. Please contact technical support.',
					new Error('No client_id parameter present and no ongoing authentication'),
				),
			);
		}
	}
}
