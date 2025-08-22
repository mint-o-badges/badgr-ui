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
import { MessageService } from '../../../common/services/message.service';
import { ApiNetworkInvitation } from '../../../issuer/models/network-invite-api.model';

@Component({
	selector: 'network-invite-confirmation',
	templateUrl: './network-invite-confirmation.component.html',
	imports: [OebButtonComponent, TranslatePipe, BgAwaitPromises],
})
export class NetworkInviteConfirmationComponent extends BaseAuthenticatedRoutableComponent {
	inviteSlug: string;
	inviteLoaded: Promise<unknown>;
	invite: ApiNetworkInvitation;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected title: Title,
		protected configService: AppConfigService,
		protected networkManager: NetworkManager,
		protected networkApiService: NetworkApiService,
		private messageService: MessageService,
	) {
		super(router, route, loginService);
		title.setTitle(`Confirm network invitation - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.inviteSlug = this.route.snapshot.params['inviteSlug'];
		this.networkApiService.getNetworkInvite(this.inviteSlug).then((invite) => {
			this.invite = invite;
		});
	}

	confirmInvitation() {
		this.networkApiService.confirmInvitation(this.invite.network.slug, this.inviteSlug).then((res) => {
			this.router.navigate(['/issuer/networks', this.invite.network.slug]),
				(err) => {
					this.messageService.reportAndThrowError('Failed to confirm invitation ' + err);
				};
		});
	}
}
