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
import { CommonModule } from '@angular/common';
import { BadgrCommonModule } from '../../../common/badgr-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../../../components/ui-accordion-helm/src';
import { HlmIconModule } from '../../../../../components/ui-icon-helm/src';

@Component({
	templateUrl: './badgeclass.component.html',
	styleUrls: ['./badgeclass.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		BadgrCommonModule,
		TranslateModule,
		HlmAccordionModule,
		BrnAccordionContentComponent,
		HlmIconModule,
		RouterModule,
	],
})
export class PublicBadgeClassComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	badgeIdParam: LoadedRouteParam<PublicApiBadgeClassWithIssuer>;
	routerLinkForUrl = routerLinkForUrl;

	showDetails: boolean[] = [];

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

	toggleDetails(index: number): void {
		this.showDetails[index] = !this.showDetails[index];
	}
}
