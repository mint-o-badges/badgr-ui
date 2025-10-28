import { Routes } from '@angular/router';








export const routes: Routes = [
	/* Recipient Badges */
	{
		path: '',
		redirectTo: 'badges',
		pathMatch: 'full',
	},
	{
		path: 'badges',
		loadComponent: () => import('./components/recipient-earned-badge-list/recipient-earned-badge-list.component').then(m => m.RecipientEarnedBadgeListComponent),
	},
	{
		path: 'badges/import',
		loadComponent: () => import('./components/recipient-earned-badge-list/recipient-earned-badge-list.component').then(m => m.RecipientEarnedBadgeListComponent),
	},
	{
		path: 'earned-badge/:badgeSlug',
		loadComponent: () => import('./components/recipient-earned-badge-detail/recipient-earned-badge-detail.component').then(m => m.RecipientEarnedBadgeDetailComponent),
	},
	{
		path: 'imported-badge/:badgeSlug',
		loadComponent: () => import('./components/imported-badge-detail/imported-badge-detail.component').then(m => m.ImportedBadgeDetailComponent),
	},

	/* Recipient Badge Collections */
	{
		path: 'badge-collections/create',
		loadComponent: () => import('./components/recipient-badge-collection-create/recipient-badge-collection-create.component').then(m => m.RecipientBadgeCollectionCreateComponent),
	},
	{
		path: 'badge-collections/:collectionSlug/edit',
		loadComponent: () => import('~/recipient-badge-collection-edit/recipient-badge-collection-edit.component').then(m => m.RecipientBadgeCollectionEditComponent),
	},
	{
		path: 'badge-collections/collection/:collectionSlug',
		loadComponent: () => import('./components/recipient-badge-collection-detail/recipient-badge-collection-detail.component').then(m => m.RecipientBadgeCollectionDetailComponent),
	},
	{
		path: '**',
		redirectTo: 'badges',
	},
];
