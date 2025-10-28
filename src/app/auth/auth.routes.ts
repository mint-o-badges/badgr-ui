import { Routes } from '@angular/router';











export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
	{
		path: 'login',
		loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
	},
	{
		path: 'logout',
		loadComponent: () => import('./components/logout/logout.component').then(m => m.LogoutComponent),
	},
	{
		path: 'login/:name',
		loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
	},
	{
		path: 'login/:name/:email',
		loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
	},
	{
		path: 'new-terms',
		loadComponent: () => import('./components/new-terms/new-terms.component').then(m => m.NewTermsComponent),
	},
	{
		path: 'new-password',
		loadComponent: () => import('./components/new-password/new-password.component').then(m => m.NewPasswordComponent),
	},

	/* OAuth2 */
	{
		path: 'oauth2/authorize',
		loadComponent: () => import('./components/oauth2-authorize/oauth2-authorize.component').then(m => m.OAuth2AuthorizeComponent),
	},

	/* Reset Password */
	{
		path: 'request-password-reset',
		loadComponent: () => import('./components/request-password-reset/request-password-reset.component').then(m => m.RequestPasswordResetComponent),
	},
	{
		path: 'request-password-reset/:email',
		loadComponent: () => import('./components/request-password-reset/request-password-reset.component').then(m => m.RequestPasswordResetComponent),
	},
	{
		path: 'reset-password-sent',
		loadComponent: () => import('./components/reset-password-sent/reset-password-sent.component').then(m => m.ResetPasswordSent),
	},
	{
		path: 'change-password',
		loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
	},
	{
		path: 'change-password/:token',
		loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
	},
	{
		path: 'welcome',
		loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent),
	},
	{
		path: '**',
		redirectTo: 'login',
	},
];
