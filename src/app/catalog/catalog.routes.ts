import { Routes } from '@angular/router';

import { BadgrRouteData } from '../common/services/navigation.service';
import { BadgeCatalogComponent } from './components/badge-catalog/badge-catalog.component';
import { IssuerCatalogComponent } from './components/issuer-catalog/issuer-catalog.component';
import { LearningPathsCatalogComponent } from './components/learningpath-catalog/learningpath-catalog.component';

export const routes: Routes = [
	{
		path: 'badges',
		component: BadgeCatalogComponent,
	},
	{
		path: 'issuers',
		component: IssuerCatalogComponent,
	},
	{
		path: 'learningpaths',
		component: LearningPathsCatalogComponent,
	},
	{
		path: '**',
		redirectTo: 'badges',
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];
