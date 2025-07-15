import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import {
	PublicApiBadgeCollectionEntryWithBadgeClassAndIssuer,
	PublicApiBadgeCollectionWithBadgeClassAndIssuer,
} from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { routerLinkForUrl } from '../public/public.component';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { SlicePipe } from '@angular/common';
import { BgImageStatusPlaceholderDirective } from '../../../common/directives/bg-image-status-placeholder.directive';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { BgBadgecard } from '../../../common/components/bg-badgecard';
import { PublicNotFoundBadgeCollectionComponent } from '../not-found-badge-collection/not-found-badge-collection.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	templateUrl: 'badge-collection.component.html',
	imports: [
		BgAwaitPromises,
		BgImageStatusPlaceholderDirective,
		HlmH1Directive,
		BgBadgecard,
		PublicNotFoundBadgeCollectionComponent,
		SlicePipe,
		TranslatePipe,
	],
})
export class PublicBadgeCollectionComponent {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	routerLinkForUrl = routerLinkForUrl;

	collectionHashParam: LoadedRouteParam<PublicApiBadgeCollectionWithBadgeClassAndIssuer>;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private title: Title,
	) {
		title.setTitle(`Collection - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.collectionHashParam = new LoadedRouteParam(
			injector.get(ActivatedRoute),
			'collectionShareHash',
			(paramValue) => {
				const service: PublicApiService = injector.get(PublicApiService);
				return service.getBadgeCollection(paramValue);
			},
		);
	}

	getBadgeUrl(badge: PublicApiBadgeCollectionEntryWithBadgeClassAndIssuer) {
		return badge.hostedUrl ? badge.hostedUrl : badge.id;
	}

	getBadgeIssuedOn(badge: PublicApiBadgeCollectionEntryWithBadgeClassAndIssuer) {
		return new Date(badge.issuedOn);
	}

	isExpired(date: string): boolean {
		return date && new Date(Date.parse(date)) < new Date();
	}

	get collection(): PublicApiBadgeCollectionWithBadgeClassAndIssuer {
		return this.collectionHashParam.value;
	}
}
