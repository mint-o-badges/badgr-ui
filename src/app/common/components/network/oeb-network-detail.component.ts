import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '../../services/session.service';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { NgIf } from '@angular/common';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { HlmADirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-a.directive';
import { Network } from '../../../issuer/models/network.model';
import { PublicApiIssuer, PublicApiNetwork } from '../../../public/models/public-api.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { OebButtonComponent } from '../../../components/oeb-button.component';

@Component({
	selector: 'oeb-network-detail',
	templateUrl: './oeb-network-detail.component.html',
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH1Directive,
		NgIf,
		HlmPDirective,
		HlmADirective,
		OebButtonComponent,
		TranslatePipe,
		RouterLink,
	],
})
export class OebNetworkDetailComponent {
	@Input() issuers: Issuer[] | PublicApiIssuer[];
	@Input() network: Network | PublicApiNetwork;
	@Input() networkPlaceholderSrc: string;
	@Input() networkActionsMenu: any;
	@Input() public: boolean = false;
	@Output() networkDeleted = new EventEmitter();

	issuersPromise: Promise<unknown>;

	constructor(
		private router: Router,
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
		private sessionService: SessionService,
	) {
		if (this.sessionService.isLoggedIn) {
		}
	}

	routeToUrl(url) {
		window.location.href = url;
	}
}
