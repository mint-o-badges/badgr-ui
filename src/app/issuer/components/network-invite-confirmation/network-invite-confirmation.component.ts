import { Component } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { NetworkManager } from '../../../issuer/services/network-manager.service';
import { Network } from '../../../issuer/models/network.model';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { NetworkApiService } from '../../../issuer/services/network-api.service';

@Component({
	selector: 'network-invite-confirmation',
	templateUrl: './network-invite-confirmation.component.html',
	imports: [OebButtonComponent, TranslatePipe, BgAwaitPromises],
})
export class NetworkInviteConfirmationComponent extends BaseAuthenticatedRoutableComponent {
	networkSlug: string;
	networkLoaded: Promise<unknown>;
	network: Network;

	inviteSlug: string;
	inviteLoaded: Promise<unknown>;
	invite: any;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected title: Title,
		protected configService: AppConfigService,
		protected networkManager: NetworkManager,
		protected networkApiService: NetworkApiService,
	) {
		super(router, route, loginService);
		title.setTitle(`Confirm network invitation - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.networkSlug = this.route.snapshot.params['networkSlug'];
		this.inviteSlug = this.route.snapshot.params['inviteSlug'];
		this.networkLoaded = this.networkManager.networkBySlug(this.networkSlug).then((network) => {
			this.network = network;
			return network;
		});
		this.networkApiService.getNetworkInvite(this.networkSlug, this.inviteSlug).then((invite) => {
			this.invite = invite;
		});
	}

	confirmInvitation() {
		this.networkApiService.confirmInvitation(this.networkSlug, this.inviteSlug).then((res) => {
			console.log('res', res);
			// this.router.navigate([''])
		});
	}
}
