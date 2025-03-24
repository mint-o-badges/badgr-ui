import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { ProfileComponent } from './components/profile/profile.component';
import { AppIntegrationListComponent } from './components/app-integrations-list/app-integrations-list.component';
import { AddCredentialsDialog } from './components/app-integration-add-credentials-dialog/add-credentials-dialog.component';
import {
	BadgebookLti1DetailComponent,
	IntegrationImageComponent,
} from './components/badgebook-lti1-integration-detail/badgebook-lti1-integration-detail.component';
import { CommonEntityManagerModule } from '../entity-manager/entity-manager.module';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { UserProfileManager } from '../common/services/user-profile-manager.service';
import { UserProfileApiService } from '../common/services/user-profile-api.service';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { OAuthAppDetailComponent } from './components/oauth-app-detail/oauth-app-detail.component';
import { MozzTransitionModule } from '../mozz-transition/mozz-transition.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppIntegrationDetailsDialog } from './components/app-integration-details-dialog/app-integration-details-dialog.component';

const routes: Routes = [
	/* Profile */
	{
		path: '',
		redirectTo: 'profile',
		pathMatch: 'full',
	},
	{
		path: 'profile',
		component: ProfileComponent,
	},
	{
		path: 'edit',
		component: ProfileEditComponent,
	},
	{
		path: 'app-integrations',
		component: AppIntegrationListComponent,
	},
	{
		path: 'app-integrations/app/canvas-lti1',
		component: BadgebookLti1DetailComponent,
	},
	{
		path: 'app-integrations/oauth-app/:appId',
		component: OAuthAppDetailComponent,
	},
	{
		path: 'change-password',
		component: ChangePasswordComponent,
	},
	{
		path: '**',
		component: ProfileComponent,
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes),
		MozzTransitionModule,
		TranslateModule,
	],
	declarations: [
		BadgebookLti1DetailComponent,
		AppIntegrationListComponent,
		ProfileComponent,
		ProfileEditComponent,
		IntegrationImageComponent,
		ChangePasswordComponent,
		OAuthAppDetailComponent,
		AddCredentialsDialog,
		AppIntegrationDetailsDialog
	],
	providers: [
	],
	exports: [],
})
export class ProfileModule {}
