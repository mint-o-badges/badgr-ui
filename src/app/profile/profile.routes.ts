import { Routes } from '@angular/router';

import { ProfileComponent } from './components/profile/profile.component';
import { AppIntegrationListComponent } from './components/app-integrations-list/app-integrations-list.component';
import {
	BadgebookLti1DetailComponent,
} from './components/badgebook-lti1-integration-detail/badgebook-lti1-integration-detail.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { OAuthAppDetailComponent } from './components/oauth-app-detail/oauth-app-detail.component';

export const routes: Routes = [
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