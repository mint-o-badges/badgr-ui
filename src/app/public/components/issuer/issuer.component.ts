import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiBadgeClass, PublicApiIssuer, PublicApiLearningPath } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from '../../../common/util/url-util';
import { routerLinkForUrl } from '../public/public.component';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';

@Component({
	templateUrl: './issuer.component.html',
})
export class PublicIssuerComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	issuerIdParam: LoadedRouteParam<{
		issuer: PublicApiIssuer;
		badges: PublicApiBadgeClass[];
		learningpaths: PublicApiLearningPath[];
	}>;
	routerLinkForUrl = routerLinkForUrl;
	plural = {
		badge: {
			'=0': 'No Badges',
			'=1': '1 Badge',
			other: '# Badges',
		},
	};

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private title: Title,
	) {
		title.setTitle(`Issuer - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'issuerId', (paramValue) => {
			const service: PublicApiService = injector.get(PublicApiService);
			return service.getIssuerWithBadgesAndLps(paramValue);
		});
	}

	get issuer(): PublicApiIssuer {
		return this.issuerIdParam.value.issuer;
	}
	get badgeClasses(): PublicApiBadgeClass[] {
		return this.issuerIdParam.value.badges;
	}

	get learningPaths(): PublicApiLearningPath[] {
		return this.issuerIdParam.value.learningpaths;
	}

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.issuer.id) + '.json';
	}
}
