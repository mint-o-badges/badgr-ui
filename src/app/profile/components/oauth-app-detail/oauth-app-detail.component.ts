import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { OAuth2AppAuthorization } from '../../../common/model/oauth.model';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { flatten } from '../../../common/util/array-reducers';
import { AppConfigService } from '../../../common/app-config.service';

@Component({
    selector: 'oauth-app-detail-component',
    templateUrl: './oauth-app-detail.html',
    standalone: false
})
export class OAuthAppDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	app: OAuth2AppAuthorization;
	appTokens: OAuth2AppAuthorization[];
	appPromise: Promise<unknown>;

	permisionScopeToIconName(scope: string): string {
		switch (scope) {
			case 'permission-issuer':
				return 'icon_issuer2';
			case 'permission-assertion':
				return 'icon_badgeaward';
			case 'permission-profile':
				return 'icon_email';
			default:
				return '';
		}
	}
	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,

		private title: Title,
		private messageService: MessageService,
		private oAuthManager: OAuthManager,
		protected configService: AppConfigService,
		private dialogService: CommonDialogsService,
	) {
		super(router, route, loginService);
		title.setTitle(`App Integrations - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.appPromise = oAuthManager.authorizedApps.loadedPromise.then((list) => {
			this.app = list.entityForUrl(this.appId);
			this.appTokens = list.entities.filter((t) => t.clientId === this.app.clientId);
			title.setTitle(`App - ${this.app.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		});
	}

	get appId() {
		return this.route.snapshot.params['appId'];
	}

	get presentationScopes() {
		const allScopes = new Set(this.appTokens.map((t) => t.scopes).reduce(flatten(), []));
		return this.app && this.oAuthManager.presentationScopesForScopes(Array.from(allScopes.values()));
	}

	ngOnInit() {
		super.ngOnInit();
	}

	async revokeAccess() {
		if (
			await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: 'Revoke Access?',
				dialogBody: `Are you sure you want to revoke access to ${this.app.name}?`,
				resolveButtonLabel: 'Revoke Access',
				rejectButtonLabel: 'Cancel',
			})
		) {
			Promise.all(this.appTokens.map((app) => app.revokeAccess()))
				.then(
					() => this.messageService.reportMajorSuccess(`Revoked access to ${this.app.name}`, true),
					(error) =>
						this.messageService.reportAndThrowError(`Failed to revoke access to ${this.app.name}`, error),
				)
				.then(() => this.router.navigate(['/profile/app-integrations']));
		}
	}
}
