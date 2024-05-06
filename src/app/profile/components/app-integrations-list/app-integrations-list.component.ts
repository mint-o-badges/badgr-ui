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
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-integration-detail',
	templateUrl: './app-integrations-list.component.html',
})
export class AppIntegrationListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		public configService: AppConfigService,
		private dialogService: CommonDialogsService,
		private applicationCredentialsService: ApplicationCredentialsService,
		private translate: TranslateService
	) {
		super(router, route, loginService);

	}

	@ViewChild('addCredentialsDialog')
	private addCredentialsDialog: AddCredentialsDialog;
	public applications;
	public generatedToken = undefined;

	ngOnInit() {
		super.ngOnInit();
		this.applicationCredentialsService.getMyCredentials().then(res => {
			this.applications = res;
		})
	}

	openDialog() {
		this.addCredentialsDialog.openDialog()
	}

	async revokeAccessTokens(app) {
		if (
			await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: this.translate.instant('Profile.deleteApp'),
				dialogBody: this.translate.instant('Profile.deleteAppConfirm'),
				resolveButtonLabel: this.translate.instant('General.delete'),
				rejectButtonLabel: this.translate.instant('General.cancel'),
			})
		) {
			//delete the App Credentials with client_id=name
			this.applicationCredentialsService.deleteCredentials(app.clientId ?? app.client_id).then(res => {
				this.applications = this.applications.filter(item => item.clientId != app.clientId)
			})
		}
	}

	addToken(token){
		this.generatedToken = token;
		this.applications.push(token)
	}
}
