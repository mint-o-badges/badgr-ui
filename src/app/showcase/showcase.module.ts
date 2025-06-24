import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BadgrCommonModule, COMMON_IMPORTS } from '../common/badgr-common.module';
import { ShowcaseComponent } from './components/showcase.component';
import { BadgrRouteData } from '../common/services/navigation.service';
import { DatatableComponent } from '../components/datatable-badges.component';

export const routes: Routes = [
	{
		path: '',
		component: ShowcaseComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];

@NgModule({
    imports: [
        ...COMMON_IMPORTS,
        BadgrCommonModule,
        RouterModule.forChild(routes),
        ShowcaseComponent,
    ],
    exports: [],
    providers: [],
})
export class ShowcaseModule {}
