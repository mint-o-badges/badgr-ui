import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { NgIf } from '@angular/common';
import { PublicApiIssuer, PublicApiNetwork } from '../../../public/models/public-api.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmP, HlmH1 } from '@spartan-ng/helm/typography';

@Component({
	selector: 'oeb-network-detail',
	templateUrl: './oeb-network-detail.component.html',
	imports: [BgImageStatusPlaceholderDirective, HlmH1, NgIf, HlmP, OebButtonComponent, TranslatePipe, RouterLink],
})
export class OebNetworkDetailComponent {
	@Input() issuers: Issuer[] | PublicApiIssuer[];
	@Input() network: any | PublicApiNetwork;
	@Input() networkPlaceholderSrc: string;
	@Input() networkActionsMenu: any;
	@Input() public: boolean = false;
	@Output() networkDeleted = new EventEmitter();

	issuersPromise: Promise<unknown>;

	constructor(
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
	) {}

	routeToUrl(url) {
		window.location.href = url;
	}
}
