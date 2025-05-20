import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BadgrCommonModule, COMMON_IMPORTS } from './common/badgr-common.module';
import { InitialRedirectComponent } from './initial-redirect.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, RouteReuseStrategy, RouterModule, Routes, UrlMatcher, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
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
// Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { CmsPageComponent } from './common/components/cms/cms-page.component';
import { CmsPostListComponent } from './common/components/cms/cms-post-list/cms-post-list.component';

registerLocaleData(localeDe);
// Force AuthModule and ProfileModule to get included in the main module. We don't want them lazy loaded because
// they basically always need to be present. We have have functions that return them, but use strings in the Routes
// because of https://github.com/angular/angular-cli/issues/4192
export function authModule() {
	return AuthModule;
}
export function profileModule() {
	return ProfileModule;
}

const cmsSlugMatcher = (
		segments: UrlSegment[],
		group: UrlSegmentGroup,
		route: Route,
		type: string
	): UrlMatchResult => {
		if (segments[0].path == type) {
			const slugSegments = segments.slice(1);
			const mergedPath = slugSegments.map(segment => segment.path).join('/');
			const mergedSegment: UrlSegment = new UrlSegment(mergedPath, { id: mergedPath });
			return ({ consumed: segments, posParams: { slug: mergedSegment } });
		}
		return null;
	};
const cmsPageMatcher: UrlMatcher = (
		segments: UrlSegment[],
		group: UrlSegmentGroup,
		route: Route
	): UrlMatchResult => cmsSlugMatcher(segments, group, route, "page");
const cmsPostMatcher: UrlMatcher = (
		segments: UrlSegment[],
		group: UrlSegmentGroup,
		route: Route
	): UrlMatchResult => cmsSlugMatcher(segments, group, route, "post");


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
		loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
	},
	{
		path: 'signup',
		loadChildren: () => import('./signup/signup.module').then((m) => m.SignupModule),
	},
	{
		path: 'recipient',
		loadChildren: () => import('./recipient/recipient.module').then((m) => m.RecipientModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'issuer',
		loadChildren: () => import('./issuer/issuer.module').then((m) => m.IssuerModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'profile',
		loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
		canActivate: [AuthGuard],
	},
	{
		path: 'public',
		loadChildren: () => import('./public/public.module').then((m) => m.PublicModule),
	},
	{
		path: 'catalog',
		loadChildren: () => import('./catalog/catalog.module').then((m) => m.CatalogModule),
	},
	...(environment.config.api?.baseUrl != 'https://api.openbadges.education'
		? [
				{
					path: 'showcase',
					loadChildren: () => import('./showcase/showcase.module').then((m) => m.ShowcaseModule),
				},
			]
		: []),

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

	// CMS contents
	{
		component: CmsPageComponent,
		data: { cmsContentType: 'page' },
		matcher: cmsPageMatcher
	},
	{
		component: CmsPageComponent,
		data: { cmsContentType: 'post' },
		matcher: cmsPostMatcher
	},
	{
		path: 'news',
		component: CmsPostListComponent,
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
	};
};

// (Translate) AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http);
}

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BrowserModule,
		RouterModule.forRoot(ROUTE_CONFIG, {}),
		BadgrCommonModule.forRoot(),
		BrowserAnimationsModule,
		MozzTransitionModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				// useFactory: (createTranslateLoader),
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
	],
	declarations: [AppComponent, InitialRedirectComponent],
	bootstrap: [AppComponent],
	providers: [
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
