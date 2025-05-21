import { Routes } from '@angular/router';

import { LogoutComponent } from './components/logout/logout.component';
import { ResetPasswordSent } from './components/reset-password-sent/reset-password-sent.component';
import { RequestPasswordResetComponent } from './components/request-password-reset/request-password-reset.component';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { OAuth2AuthorizeComponent } from './components/oauth2-authorize/oauth2-authorize.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NewTermsComponent } from './components/new-terms/new-terms.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
	{
		path: 'login',
		component: LoginComponent,
	},
	{
		path: 'logout',
		component: LogoutComponent,
	},
	{
		path: 'login/:name',
		component: LoginComponent,
	},
	{
		path: 'login/:name/:email',
		component: LoginComponent,
	},
	{
		path: 'new-terms',
		component: NewTermsComponent,
	},

	/* OAuth2 */
	{
		path: 'oauth2/authorize',
		component: OAuth2AuthorizeComponent,
	},

	/* Reset Password */
	{
		path: 'request-password-reset',
		component: RequestPasswordResetComponent,
	},
	{
		path: 'request-password-reset/:email',
		component: RequestPasswordResetComponent,
	},
	{
		path: 'reset-password-sent',
		component: ResetPasswordSent,
	},
	{
		path: 'change-password',
		component: ResetPasswordComponent,
	},
	{
		path: 'change-password/:token',
		component: ResetPasswordComponent,
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
	},
	{
		path: '**',
		redirectTo: 'login',
	},
];