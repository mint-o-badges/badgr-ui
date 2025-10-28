import { Routes } from '@angular/router';

import { BadgrRouteData } from '../common/services/navigation.service';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./components/showcase.component').then((m) => m.ShowcaseComponent),
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];
