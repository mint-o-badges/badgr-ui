import { Component, Injector } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiBadgeClassWithIssuer, PublicApiIssuer } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from '../../../common/util/url-util';
import { routerLinkForUrl } from '../public/public.component';
import { AppConfigService } from '../../../common/app-config.service';
import { Title } from '@angular/platform-browser';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';

@Component({
	template: '<bg-badgedetail [config]="config" [awaitPromises]="[badgeClass]"></bg-badgedetail>',
})
export class PublicBadgeClassComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	badgeIdParam: LoadedRouteParam<PublicApiBadgeClassWithIssuer>;
	routerLinkForUrl = routerLinkForUrl;

	config: PageConfig

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private title: Title,
	) {
		title.setTitle(`Badge Class - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.badgeIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'badgeId', (paramValue) => {
			const service: PublicApiService = injector.get(PublicApiService);
			const badgeClass = service.getBadgeClass(paramValue);
			badgeClass.then((badge) => {
				this.config = {
					badgeTitle: badge.name,
					badgeDescription: badge.description,
					issuerSlug: badge.issuer['slug'],
					slug: badge.id,
					category: badge['extensions:CategoryExtension'].Category === 'competency' ? 'Kompetenz- Badge' : 'Teilnahme- Badge',
					tags: badge.tags,
					issuerName: badge.issuer.name,
					issuerImagePlacholderUrl: this.issuerImagePlaceholderUrl,
					issuerImage: badge.issuer.image,
					badgeLoadingImageUrl: this.badgeLoadingImageUrl,
					badgeFailedImageUrl: this.badgeFailedImageUrl,
					badgeImage: badge.image,
					competencies: badge['extensions:CompetencyExtension'],
					crumbs: [{ title: 'Badges', routerLink: ['/catalog/badges'] }, { title: badge.name }],
				}
			})
			return badgeClass
		});
	}

	get badgeClass(): PublicApiBadgeClassWithIssuer {
		return this.badgeIdParam.value;
	}

	get issuer(): PublicApiIssuer {
		return this.badgeClass.issuer;
	}

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.badgeClass.id) + '.json';
	}
}
