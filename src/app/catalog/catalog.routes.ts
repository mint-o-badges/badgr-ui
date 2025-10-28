import { Routes } from '@angular/router';

import { BadgrRouteData } from '../common/services/navigation.service';

export const routes: Routes = [
	{
		path: 'badges',
		loadComponent: () =>
			import('./components/badge-catalog/badge-catalog.component').then((m) => m.BadgeCatalogComponent),
	},
	{
		path: 'issuers',
		loadComponent: () =>
			import('./components/issuer-catalog/issuer-catalog.component').then((m) => m.IssuerCatalogComponent),
	},
	{
		path: 'learningpaths',
		loadComponent: () =>
			import('./components/learningpath-catalog/learningpath-catalog.component').then(
				(m) => m.LearningPathsCatalogComponent,
			),
	},
	{
		path: 'networks',
		loadComponent: () =>
			import('./components/network-catalog/network-catalog.component').then((m) => m.NetworkCatalogComponent),
	},
	{
		path: '**',
		redirectTo: 'badges',
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];
