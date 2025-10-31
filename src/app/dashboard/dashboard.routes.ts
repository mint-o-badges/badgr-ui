import { Routes } from '@angular/router';
import { DashboardWrapperComponent } from './components/dashboard-wrapper/dashboard-wrapper.component';
import { RegionalFilterComponent } from './components/regional-filter/regional-filter.component';
import { MunicipalDashboardComponent } from './components/municipal-dashboard/municipal-dashboard.component';

export const routes: Routes = [
	{
		path: '',
		component: DashboardWrapperComponent,
	},
	{
		path: 'regional-select',
		component: RegionalFilterComponent,
	},
	{
		path: 'view',
		component: MunicipalDashboardComponent,
	},
];
