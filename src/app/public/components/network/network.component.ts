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
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { OebNetworkDetailComponent } from '../../../common/components/network/oeb-network-detail.component';

@Component({
	templateUrl: './network.component.html',
	imports: [BgAwaitPromises, OebNetworkDetailComponent],
})
export class PublicNetworkComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	networkIdParam: LoadedRouteParam<{
		network: PublicApiIssuer;
		issuers: PublicApiIssuer[];
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

		this.networkIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'networkId', (paramValue) => {
			const service: PublicApiService = injector.get(PublicApiService);
			return service.getNetworkWithIssuers(paramValue);
		});
	}

	get network(): PublicApiIssuer {
		return this.networkIdParam.value.network;
	}

	get issuers(): PublicApiIssuer[] {
		return this.networkIdParam.value.issuers;
	}

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.network.id) + '.json';
	}
}
