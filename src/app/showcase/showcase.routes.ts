import { Routes } from '@angular/router';
import { ShowcaseComponent } from './components/showcase.component';
import { BadgrRouteData } from '../common/services/navigation.service';

export const routes: Routes = [
	{
		path: '',
		component: ShowcaseComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];