import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { AppIntegrationManager } from '../../services/app-integration-manager.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { OAuth2AppAuthorization } from '../../../common/model/oauth.model';
import { groupIntoObject } from '../../../common/util/array-reducers';
import { AppConfigService } from '../../../common/app-config.service';
import { AddCredentialsDialog } from '../app-integration-add-credentials-dialog/add-credentials-dialog.component';
import { ApplicationCredentialsService } from '../../../common/services/application-credentials.service.';

@Component({
	selector: 'app-integration-detail',
	templateUrl: './app-integrations-list.component.html',
})
export class AppIntegrationListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private title: Title,
		private messageService: MessageService,
		private appIntegrationManager: AppIntegrationManager,
		private oAuthManager: OAuthManager,
		public configService: AppConfigService,
		private dialogService: CommonDialogsService,
		private applicationCredentialsService: ApplicationCredentialsService
	) {
		super(router, route, loginService);

		title.setTitle(`App Integrations - ${this.configService.theme['serviceName'] || 'Badgr'}`);
	}

	// get appIntegrationsSet() {
	// 	return this.appIntegrationManager.appIntegrations;
	// }

	// get oAuthApps() {
	// 	// omit tokens with clientId='public' and only return first token per application
	// 	const omittedClientIds = ['public'];
	// 	const groupedByApplication = this.oAuthManager.authorizedApps.entities
	// 		.filter((a) => omittedClientIds.indexOf(a.clientId) === -1)
	// 		.reduce(
	// 			groupIntoObject((a) => a.clientId),
	// 			{},
	// 		);
	// 	return Object.values(groupedByApplication).map((a) => a[0]);
	// }

	@ViewChild('addCredentialsDialog')
	private addCredentialsDialog: AddCredentialsDialog;
	public applications;

	ngOnInit() {
		super.ngOnInit();
		this.applicationCredentialsService.getMyCredentials().then(res => {
			this.applications = res;
		})

	}

	openDialog() {
		this.addCredentialsDialog.openDialog()
	}

	async revokeAccessTokens(app: OAuth2AppAuthorization) {
		if (
			await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: 'App Credentials löschen?',
				dialogBody: `Möchtest du deinen Access token ${app.name} wirklich löschen?`,
				resolveButtonLabel: 'Löschen',
				rejectButtonLabel: 'Abbrechen',
			})
		) {
			// revoke all tokens for the app
			Promise.all(
				this.oAuthManager.authorizedApps.entities
					.filter((t) => t.clientId === app.clientId)
					.map((t) => t.revokeAccess()),
			).then(
				() => this.messageService.reportMinorSuccess(`Revoked access ${app.name}`),
				(error) => this.messageService.reportAndThrowError(`Failed to revoke access to ${app.name}`, error),
			);

			//delete the App Credentials with client_id=name
			this.applicationCredentialsService.deleteCredentials(app.clientId).then(res => {
				this.applications = this.applications.filter(item => item.clientId != app.clientId)
			})
		}
	}

	async revokeApp(app: OAuth2AppAuthorization) {
		if (
			await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: 'Revoke Access?',
				dialogBody: `Are you sure you want to revoke access to ${app.name}?`,
				resolveButtonLabel: 'Revoke Access',
				rejectButtonLabel: 'Cancel',
			})
		) {
			// revoke all tokens for the app
			Promise.all(
				this.oAuthManager.authorizedApps.entities
					.filter((t) => t.clientId === app.clientId)
					.map((t) => t.revokeAccess()),
			).then(
				() => this.messageService.reportMinorSuccess(`Revoked access ${app.name}`),
				(error) => this.messageService.reportAndThrowError(`Failed to revoke access to ${app.name}`, error),
			);
		}
	}
}
