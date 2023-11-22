import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Angulartics2, Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleTagManager } from 'angulartics2';

import { AppComponent } from './app.component';
import { BadgrCommonModule, COMMON_IMPORTS } from './common/badgr-common.module';
import { InitialRedirectComponent } from './initial-redirect.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { ForwardRouteComponent } from './common/pages/forward-route.component';
import { BadgrRouteReuseStrategy } from './common/util/route-reuse-strategy';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RecipientBadgeApiService } from './recipient/services/recipient-badges-api.service';
import { AppConfigService } from './common/app-config.service';
import { initializeTheme } from '../theming/theme-setup';
import { timeoutPromise } from './common/util/promise-util';
import { MozzTransitionModule } from './mozz-transition/mozz-transition.module';

// Force AuthModule and ProfileModule to get included in the main module. We don't want them lazy loaded because
// they basically always need to be present. We have have functions that return them, but use strings in the Routes
// because of https://github.com/angular/angular-cli/issues/4192
export function authModule() {
	return AuthModule;
}
export function profileModule() {
	return ProfileModule;
}

const ROUTE_CONFIG: Routes = [
	{
		path: '',
		redirectTo: '/initial-redirect',
		pathMatch: 'full',
	},
	{
		path: 'initial-redirect',
		component: InitialRedirectComponent,
	},
	{
		path: 'forward',
		component: ForwardRouteComponent,
	},
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
	},
	{
		path: 'signup',
		loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule),
	},
	{
		path: 'recipient',
		loadChildren: () => import('./recipient/recipient.module').then(m => m.RecipientModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'issuer',
		loadChildren: () => import('./issuer/issuer.module').then(m => m.IssuerModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'profile',
		loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'public',
		loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
	},
	{
		path: 'catalog',
		loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogModule),
	},
	// Legacy Auth Redirects
	{
		path: 'login',
		redirectTo: '/auth/login',
		pathMatch: 'full',
	},
	{
		path: 'login/:name',
		redirectTo: '/auth/login/:name',
		pathMatch: 'full',
	},
	{
		path: 'login/:name/:email',
		redirectTo: '/auth/login/:name/:email',
		pathMatch: 'full',
	},
	{
		path: 'change-password/:token',
		redirectTo: '/auth/change-password/:token',
		pathMatch: 'full',
	},
	// catchall
	{
		path: '**',
		redirectTo: '/initial-redirect',
	},
];

export const appInitializerFn = (configService: AppConfigService) => {
	return async () => {
		const configPromise = configService.initializeConfig();

		// Expose the configuration to external scripts for debugging and testing.
		window['badgrConfigPromise'] = configPromise;

		const config = await configPromise;

		window['badgrConfig'] = config;

		initializeTheme(configService);

		// Google Tag Manager
		const aKey = config.googleAnalytics.trackingId; // 'GTM-5DLJTBB';
		const aScript = document.createElement('script');
		aScript.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
				new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		})(window,document,'script','dataLayer','${aKey}');`;

		document.getElementsByTagName('head')[0].appendChild(aScript);
	};
};

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BrowserModule,
		RouterModule.forRoot(ROUTE_CONFIG, { relativeLinkResolution: 'legacy' }),
		Angulartics2Module.forRoot(),
		BadgrCommonModule.forRoot(),
		BrowserAnimationsModule,
		MozzTransitionModule,
	],
	declarations: [AppComponent, InitialRedirectComponent],
	bootstrap: [AppComponent],
	providers: [
		Angulartics2,
		Angulartics2GoogleTagManager,
		RecipientBadgeApiService,
		{ provide: RouteReuseStrategy, useClass: BadgrRouteReuseStrategy },
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializerFn,
			multi: true,
			deps: [AppConfigService],
		},
	],
})
export class AppModule {}
