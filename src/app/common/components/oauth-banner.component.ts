import { Component, inject } from '@angular/core';
import { MessageService } from '../services/message.service';
import { OAuthManager } from '../services/oauth-manager.service';

@Component({
	selector: 'oauth-banner',
	host: {
		'[class]': "'authlink'",
	},
	template: `
		@if (isAuthorizing) {
			<div><img [src]="appInfo.image" alt="{{ appInfo.name }} Logo" height="72" /></div>
			<div><img [src]="authLinkBadgrLogoSrc" height="72" alt="Logo" /></div>
		}
	`,
	imports: [],
})
export class OAuthBannerComponent {
	private messageService = inject(MessageService);
	oAuthManager = inject(OAuthManager);

	readonly authLinkBadgrLogoSrc = '../../../breakdown/static/images/logo.svg';

	get authInfo() {
		return this.oAuthManager.currentAuthorization;
	}

	get appInfo() {
		return this.oAuthManager.currentAuthorization.application;
	}

	get isAuthorizing() {
		return this.oAuthManager.isAuthorizationInProgress;
	}

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}
}
