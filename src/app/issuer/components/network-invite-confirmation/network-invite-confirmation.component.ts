import { Component, inject } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { MessageService } from '../../../common/services/message.service';
import { ApiNetworkInvitation } from '../../../issuer/models/network-invite-api.model';
import { BadgrApiFailure } from '~/common/services/api-failure';
import { FormMessageComponent } from '~/common/components/form-message.component';

@Component({
	selector: 'network-invite-confirmation',
	templateUrl: './network-invite-confirmation.component.html',
	imports: [OebButtonComponent, TranslatePipe, BgAwaitPromises, FormMessageComponent, RouterLink],
})
export class NetworkInviteConfirmationComponent extends BaseAuthenticatedRoutableComponent {
	protected title = inject(Title);
	protected configService = inject(AppConfigService);
	protected networkApiService = inject(NetworkApiService);
	protected messageService = inject(MessageService);

	inviteSlug: string;
	inviteLoaded: Promise<unknown>;
	invite: ApiNetworkInvitation;
	alreadyConfirmed = false;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(SessionService);
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route, loginService);
		const title = this.title;

		title.setTitle(`Confirm network invitation - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.inviteSlug = this.route.snapshot.params['inviteSlug'];
		this.networkApiService.getNetworkInvite(this.inviteSlug).then((invite) => {
			this.invite = invite;
		});

		this.route.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('confirmed')) {
				this.alreadyConfirmed = true;
			}
		});
	}

	confirmInvitation() {
		this.networkApiService
			.confirmInvitation(this.invite.network.slug, this.inviteSlug)
			.then((res) => {
				this.router.navigate(['/issuer/networks', this.invite.network.slug]);
			})
			.catch((err) => {
				this.messageService.reportAndThrowError(`${BadgrApiFailure.from(err).firstMessage}`, err);
			});
	}
}
