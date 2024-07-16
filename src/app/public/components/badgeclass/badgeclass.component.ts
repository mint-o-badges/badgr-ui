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
import { PageConfig } from '../../../common/components/badge-detail';

@Component({
	template: `<span>hello</span>`,
	// template: '<bg-badgedetail [config]="config"></bg-badgedetail>',
	// styleUrls: ['./badgeclass.component.css']
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
			return service.getBadgeClass(paramValue);
		});

		console.log(this.badgeClass)

		// this.config = {
		// 	badgeTitle: this.badgeClass.name,
		// 	menuitems: [],
		// 	badgeDescription: this.badgeClass.description,
		// 	issuerSlug: this.issuer.id,
		// 	slug: this.badgeClass.id,
		// 	createdAt: new Date(),
		// 	updatedAt: new Date(),
		// 	category: '',
		// 	tags: this.badgeClass.tags,
		// 	issuerName: this.issuer.name,
		// 	issuerImagePlacholderUrl: '',
		// 	issuerImage: '',
		// 	badgeLoadingImageUrl: this.badgeLoadingImageUrl,
		// 	badgeFailedImageUrl: this.badgeFailedImageUrl,
		// 	badgeImage: this.badgeClass.image,
		// 	competencies: [] as any,
		// }
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
