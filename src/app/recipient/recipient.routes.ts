import { Routes } from '@angular/router';

import { RecipientBadgeCollectionDetailComponent } from './components/recipient-badge-collection-detail/recipient-badge-collection-detail.component';
import { RecipientEarnedBadgeDetailComponent } from './components/recipient-earned-badge-detail/recipient-earned-badge-detail.component';
import { RecipientEarnedBadgeListComponent } from './components/recipient-earned-badge-list/recipient-earned-badge-list.component';
import { RecipientBadgeCollectionCreateComponent } from './components/recipient-badge-collection-create/recipient-badge-collection-create.component';
import { ImportedBadgeDetailComponent } from './components/imported-badge-detail/imported-badge-detail.component';
import { RecipientBadgeCollectionEditComponent } from '~/recipient-badge-collection-edit/recipient-badge-collection-edit.component';

export const routes: Routes = [
	/* Recipient Badges */
	{
		path: '',
		redirectTo: 'badges',
		pathMatch: 'full',
	},
	{
		path: 'badges',
		component: RecipientEarnedBadgeListComponent,
	},
	{
		path: 'badges/import',
		component: RecipientEarnedBadgeListComponent,
	},
	{
		path: 'earned-badge/:badgeSlug',
		component: RecipientEarnedBadgeDetailComponent,
	},
	{
		path: 'imported-badge/:badgeSlug',
		component: ImportedBadgeDetailComponent,
	},

	/* Recipient Badge Collections */
	{
		path: 'badge-collections/create',
		component: RecipientBadgeCollectionCreateComponent,
	},
	{
		path: 'badge-collections/:collectionSlug/edit',
		component: RecipientBadgeCollectionEditComponent,
	},
	{
		path: 'badge-collections/collection/:collectionSlug',
		component: RecipientBadgeCollectionDetailComponent,
	},
	{
		path: '**',
		redirectTo: 'badges',
	},
];
