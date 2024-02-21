import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BadgrCommonModule, COMMON_IMPORTS} from '../common/badgr-common.module';

import {RecipientBadgeCollectionDetailComponent} from './components/recipient-badge-collection-detail/recipient-badge-collection-detail.component';
import {RecipientBadgeCollectionListComponent} from './components/recipient-badge-collection-list/recipient-badge-collection-list.component';
import {RecipientEarnedBadgeDetailComponent} from './components/recipient-earned-badge-detail/recipient-earned-badge-detail.component';
import {RecipientEarnedBadgeListComponent} from './components/recipient-earned-badge-list/recipient-earned-badge-list.component';
import {AddBadgeDialogComponent} from './components/add-badge-dialog/add-badge-dialog.component';
import {RecipientBadgeApiService} from './services/recipient-badges-api.service';
import {RecipientBadgeManager} from './services/recipient-badge-manager.service';
import {RecipientBadgeCollectionApiService} from './services/recipient-badge-collection-api.service';
import {RecipientBadgeCollectionManager} from './services/recipient-badge-collection-manager.service';
import {RecipientBadgeCollectionCreateComponent} from './components/recipient-badge-collection-create/recipient-badge-collection-create.component';
import {RecipientBadgeCollectionEditFormComponent} from './components/recipient-badge-collection-edit-form/recipient-badge-collection-edit-form.component';
import {CommonEntityManagerModule} from '../entity-manager/entity-manager.module';
import { RecipientBadgeCollectionSelectionDialogComponent } from "./components/recipient-badge-collection-selection-dialog/recipient-badge-collection-selection-dialog.component";
import { RecipientBadgeSelectionDialog } from "./components/recipient-badge-selection-dialog/recipient-badge-selection-dialog.component";
import { MozzTransitionModule } from "../mozz-transition/mozz-transition.module";
import { TranslateModule } from '@ngx-translate/core';
import { SuperBadgeManager } from '../issuer/services/superbadge-manager.service';
import { SuperBadgeApiService } from '../issuer/services/superbadge-api.service';

const routes: Routes = [
	/* Recipient Badges */
	{
		path: "",
		redirectTo: 'badges',
        pathMatch: 'full'
	},
	{
		path: "badges",
		component: RecipientEarnedBadgeListComponent
	},
	{
		path: "badges/import",
		component: RecipientEarnedBadgeListComponent

	},
	{
		path: "earned-badge/:badgeSlug",
		component: RecipientEarnedBadgeDetailComponent
	},

	/* Recipient Badge Collections */
	{
		path: "badge-collections",
		component: RecipientBadgeCollectionListComponent
	},
	{
		path: "badge-collections/create",
		component: RecipientBadgeCollectionCreateComponent,
	},
	{
		path: "badge-collections/collection/:collectionSlug",
		component: RecipientBadgeCollectionDetailComponent
	},
	{
		path: "**",
		redirectTo: 'badges',
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes),
		MozzTransitionModule,
		TranslateModule
	],
	declarations: [
		RecipientEarnedBadgeListComponent,
		RecipientEarnedBadgeDetailComponent,
		RecipientBadgeCollectionListComponent,
		RecipientBadgeCollectionCreateComponent,
		RecipientBadgeCollectionDetailComponent,
		RecipientBadgeCollectionEditFormComponent,
		RecipientBadgeCollectionSelectionDialogComponent,
		RecipientBadgeSelectionDialog,
		AddBadgeDialogComponent
	],
	providers: [
		RecipientBadgeApiService,
		RecipientBadgeManager,
		RecipientBadgeCollectionApiService,
		RecipientBadgeCollectionManager,
		SuperBadgeManager,
		SuperBadgeApiService
	],
	exports: []
})
export class RecipientModule {}
