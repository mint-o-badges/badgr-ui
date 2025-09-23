import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { NgIf } from '@angular/common';
import { PublicApiIssuer } from '../../../public/models/public-api.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmP, HlmH1 } from '@spartan-ng/helm/typography';
import { Network } from '~/issuer/network.model';
import { BgBreadcrumbsComponent, LinkEntry } from '../bg-breadcrumbs/bg-breadcrumbs.component';

@Component({
	selector: 'oeb-network-detail',
	templateUrl: './oeb-network-detail.component.html',
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH1,
		NgIf,
		HlmP,
		OebButtonComponent,
		TranslatePipe,
		RouterLink,
		BgBreadcrumbsComponent,
	],
})
export class OebNetworkDetailComponent {
	@Input() issuers: Issuer[] | PublicApiIssuer[];
	@Input() network: Network | PublicApiIssuer;
	@Input() networkPlaceholderSrc: string;
	@Input() networkActionsMenu: any;
	@Input() public: boolean = false;
	@Output() networkDeleted = new EventEmitter();

	issuersPromise: Promise<unknown>;

	linkentries: LinkEntry[] = [];

	constructor(
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
	) {}

	ngOnInit() {
		this.linkentries = [
			{ title: this.translate.instant('Network.networksNav'), routerLink: ['/catalog/networks'] },
			{
				title: this.network.name,
				routerLink: ['/public/networks/' + this.network.slug],
			},
		];
	}

	routeToUrl(url) {
		window.location.href = url;
	}
}
