import { Routes } from '@angular/router';

import { PublicComponent } from './components/public/public.component';
import { PublicBadgeAssertionComponent } from './components/badge-assertion/badge-assertion.component';
import { PublicBadgeClassComponent } from './components/badgeclass/badgeclass.component';
import { PublicIssuerComponent } from './components/issuer/issuer.component';
import { PublicBadgeCollectionComponent } from './components/badge-collection/badge-collection.component';
import { BadgrRouteData } from '../common/services/navigation.service';
import { AboutComponent } from './components/about/about.component';
import { NewsletterComponent } from './components/about/newsletter/newsletter.component';
import { StartComponent } from './components/start/start.component';
import { ImpressumComponent } from './components/impressum/impressum.component';
import { TermsComponent } from './components/terms-of-service/terms-of-service.component';
import { FaqComponent } from './components/faq/faq.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { RequestBadgeComponent } from '../issuer/components/request-badge/request-badge.component';
import { PdfDownloadComponent } from './components/pdf-download/pdf-download.component';
import { PublicLearningPathComponent } from './components/learningpath/learningpath.component';

export const routes: Routes = [
	{
		path: '',
		component: PublicComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'downloads/:pdfName',
		component: PdfDownloadComponent,
	},
	{
		path: 'about',
		component: AboutComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'about/newsletter',
		component: NewsletterComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'start',
		component: StartComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'impressum',
		component: ImpressumComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'terms',
		component: TermsComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'privacy',
		component: PrivacyComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'faq',
		component: FaqComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},

	{
		path: 'assertions/:assertionId',
		component: PublicBadgeAssertionComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},

	{
		path: 'badges/:badgeId',
		component: PublicBadgeClassComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},

	{
		path: 'issuers/:issuerId',
		component: PublicIssuerComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'learningpaths/:learningPathId',
		component: PublicLearningPathComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
	{
		path: 'issuer/issuers/:issuerSlug/badges/:badgeSlug/request/:qrCodeId',
		component: RequestBadgeComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},

	{
		path: 'collections/:collectionShareHash',
		component: PublicBadgeCollectionComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},

	{
		path: '**',
		component: PublicComponent,
		data: {
			publiclyAccessible: true,
		} as BadgrRouteData,
	},
];