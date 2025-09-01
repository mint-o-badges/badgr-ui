import { Component, ElementRef, inject, input, Input, output, signal, TemplateRef, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NetworkPartnersDatatableComponent } from '../../../components/datatable-network-partners.component';
import { NetworkInvitesDatatableComponent } from '../../../components/datatable-network-invites.component';
import { Network } from '../../../issuer/models/network.model';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { OebTabsComponent } from '~/components/oeb-tabs.component';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'network-badges',
	templateUrl: './network-badges.component.html',
	imports: [TranslatePipe, OebButtonComponent, OebTabsComponent, BgAwaitPromises, RouterLink],
})
export class NetworkBadgesComponent {
	constructor(private networkApiService: NetworkApiService) {}
	network = input.required<Network>();

	tabs: any = undefined;

	activeTab = 'network';

	@ViewChild('networkTemplate', { static: true }) networkTemplate: ElementRef;
	@ViewChild('partnerTemplate', { static: true }) partnerTemplate: ElementRef;

	ngOnInit() {}

	ngAfterContentInit() {
		this.tabs = [
			{
				key: 'network',
				title: 'Network',
				icon: 'lucideShipWheel',
				count: 2,
				component: this.networkTemplate,
			},
			{
				key: 'partner',
				title: 'Partner-Badges',
				component: this.partnerTemplate,
			},
		];
	}

	onTabChange(tab) {
		this.activeTab = tab;
	}
}
