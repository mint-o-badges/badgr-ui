import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { AppConfigService } from '../../../common/app-config.service';
import { AddCredentialsDialog } from '../app-integration-add-credentials-dialog/add-credentials-dialog.component';
import { AppIntegrationDetailsDialog } from '../app-integration-details-dialog/app-integration-details-dialog.component';
import { ApplicationCredentialsService } from '../../../common/services/application-credentials.service.';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-integration-detail',
    templateUrl: './app-integrations-list.component.html',
    imports: [
        FormMessageComponent,
        NgIf,
        AddCredentialsDialog,
        AppIntegrationDetailsDialog,
        NgFor,
        TranslatePipe,
    ],
})
export class AppIntegrationListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		public configService: AppConfigService,
		private dialogService: CommonDialogsService,
		private applicationCredentialsService: ApplicationCredentialsService,
		private translate: TranslateService,
	) {
		super(router, route, loginService);
	}

	@ViewChild('addCredentialsDialog')
	private addCredentialsDialog: AddCredentialsDialog;
	@ViewChild('appIntegrationDetailsDialog')
	private appIntegrationDetailsDialog: AppIntegrationDetailsDialog;
	public applications;
	public generatedToken = undefined;
	public selectedApplication = undefined;

	ngOnInit() {
		super.ngOnInit();
		this.applicationCredentialsService.getMyCredentials().then((res) => {
			this.applications = res;
		});
	}

	openDialog() {
		this.addCredentialsDialog.openDialog();
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
			this.applicationCredentialsService.deleteCredentials(app.clientId ?? app.client_id).then((res) => {
				this.applications = this.applications.filter((item) => item.clientId != app.clientId);
			});
		}
	}

	addToken(token) {
		this.generatedToken = token;
		this.applications.push(token);
	}

	selectApplication(application) {
		this.appIntegrationDetailsDialog.openDialog(application);
	}
}
