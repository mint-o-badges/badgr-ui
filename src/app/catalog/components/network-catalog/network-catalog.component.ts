import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';

import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { FormControl, FormsModule } from '@angular/forms';
import { appearAnimation } from '../../../common/animations/animations';
import { applySorting } from '../../util/sorting';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { CountUpModule } from 'ngx-countup';
import { NgClass } from '@angular/common';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { OebGlobalSortSelectComponent } from '../../../components/oeb-global-sort-select.component';
import { OebSelectComponent } from '../../../components/select.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { IssuerCardComponent } from '../../../components/issuer-card/issuer-card.component';
import { PaginationAdvancedComponent } from '../../../components/oeb-numbered-pagination';
import { Network } from '../../../issuer/models/network.model';
import { NetworkManager } from '../../../issuer/services/network-manager.service';
import { OebNetworkCard } from '~/common/components/oeb-networkcard.component';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-issuer-catalog',
	templateUrl: './network-catalog.component.html',
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
		HlmH1Directive,
		BgAwaitPromises,
		CountUpModule,
		FormsModule,
		HlmInputDirective,
		NgIcon,
		HlmIconDirective,
		OebGlobalSortSelectComponent,
		OebSelectComponent,
		NgClass,
		OebButtonComponent,
		IssuerCardComponent,
		PaginationAdvancedComponent,
		TranslatePipe,
		OebNetworkCard,
		RouterLink,
	],
})
export class NetworkCatalogComponent extends BaseRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	networks: Network[] = null;
	chooseABadgeCategory = this.translate.instant('CreateBadge.chooseABadgeCategory');

	networksLoaded: Promise<unknown>;
	issuerResults: Network[] = [];

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	get networksPluralWord(): string {
		return this.plural['network']['=0'];
	}

	plural = {};

	networksPerPage = 30;
	totalPages: number;
	nextLink: string;
	previousLink: string;

	sortOption: string | null = null;

	public loggedIn = false;

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected networkManager: NetworkManager,
		protected configService: AppConfigService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
		public sessionService: SessionService,
		protected profileManager: UserProfileManager,
	) {
		super(router, route);
		title.setTitle(`Networks - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.networksLoaded = this.loadNetworks();
	}

	async loadNetworks() {
		let that = this;
		return new Promise(async (resolve, reject) => {
			this.networkManager.getAllNetworks().subscribe(
				(networks) => {
					console.log('url', networks[0].url);
					this.networks = networks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					// this.totalPages = Math.ceil(this.issuers.length / this.issuersPerPage);
					// this.updatePaginatedResults();
					// this.issuerResults = this.issuers;
					// this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));
					// if (this.mapObject)
					// 	this.mapObject.on('load', function () {
					// 		that.generateGeoJSON(that.issuerResults);
					// 	});
					resolve(networks);
				},
				(error) => {
					this.messageService.reportAndThrowError(this.translate.instant('Issuer.failLoadissuers'), error);
				},
			);
		});
	}

	ngOnInit() {
		super.ngOnInit();

		this.loggedIn = this.sessionService.isLoggedIn;

		this.plural = {
			network: {
				'=0': this.translate.instant('Network.noNetworks'),
				'=1': '1 ' + this.translate.instant('Network.networkRegistered'),
				other: '# ' + this.translate.instant('Network.networksRegistered'),
			},
		};
	}

	// private updatePaginatedResults() {
	// 	let that = this;
	// 	// Clear Results
	// 	this.issuerResults = [];
	// 	this.issuerResultsByCategory = [];

	// 	// this.issuerResults.sort((a, b) => a.name.localeCompare(b.name));

	// 	this.filteredIssuers = this.issuers
	// 		.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
	// 		.filter((issuer) => !this.categoryFilter || issuer.category === this.categoryFilter);

	// 	if (this.sortOption) {
	// 		applySorting(this.filteredIssuers, this.sortOption);
	// 	}
	// 	this.totalPages = Math.ceil(this.filteredIssuers.length / this.issuersPerPage);
	// 	const start = (this.currentPage - 1) * this.issuersPerPage;
	// 	const end = start + this.issuersPerPage;

	// 	that.issuerResults = this.filteredIssuers.slice(start, end);
	// 	// this.issuerResults = this.issuers
	// 	// 	.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery))
	// 	// 	.filter((issuer) => !this.categoryFilter || issuer.category === this.categoryFilter);
	// 	// this.issuerResultsByCategory.forEach((r) => r.issuers.sort((a, b) => a.name.localeCompare(b.name)));
	// 	// this.generateGeoJSON(this.issuerResults);
	// }
}
