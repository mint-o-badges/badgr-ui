import { Route, Routes, UrlMatcher, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthGuard } from './common/guards/auth.guard';
import { ForwardRouteComponent } from './common/pages/forward-route.component';
import { InitialRedirectComponent } from './initial-redirect.component';
import { CmsPageComponent } from './common/components/cms/cms-page.component';
import { CmsPostListComponent } from './common/components/cms/cms-post-list/cms-post-list.component';

const cmsSlugMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route, type: string): UrlMatchResult => {
	if (segments[0].path == type) {
		const slugSegments = segments.slice(1);
		const mergedPath = slugSegments.map((segment) => segment.path).join('/');
		const mergedSegment: UrlSegment = new UrlSegment(mergedPath, { id: mergedPath });
		return { consumed: segments, posParams: { slug: mergedSegment } };
	}
	return null;
};
const cmsPageMatcher: UrlMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult =>
	cmsSlugMatcher(segments, group, route, 'page');
const cmsPostMatcher: UrlMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult =>
	cmsSlugMatcher(segments, group, route, 'post');

export const ROUTE_CONFIG: Routes = [
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
		loadChildren: () => import('./auth/auth.routes').then((m) => m.routes),
	},
	{
		path: 'signup',
		loadChildren: () => import('./signup/signup.routes').then((m) => m.routes),
	},
	{
		path: 'recipient',
		loadChildren: () => import('./recipient/recipient.routes').then((m) => m.routes),
		canActivate: [AuthGuard],
	},
	{
		path: 'issuer',
		loadChildren: () => import('./issuer/issuer.routes').then((m) => m.routes),
		canActivate: [AuthGuard],
	},
	{
		path: 'profile',
		loadChildren: () => import('./profile/profile.routes').then((m) => m.routes),
		canActivate: [AuthGuard],
	},
	{
		path: 'public',
		loadChildren: () => import('./public/public.routes').then((m) => m.routes),
	},
	{
		path: 'catalog',
		loadChildren: () => import('./catalog/catalog.routes').then((m) => m.routes),
	},
	...(environment.config.api?.baseUrl != 'https://api.openbadges.education'
		? [
				{
					path: 'showcase',
					loadChildren: () => import('./showcase/showcase.routes').then((m) => m.routes),
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
		matcher: cmsPageMatcher,
	},
	{
		component: CmsPageComponent,
		data: { cmsContentType: 'post' },
		matcher: cmsPostMatcher,
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
