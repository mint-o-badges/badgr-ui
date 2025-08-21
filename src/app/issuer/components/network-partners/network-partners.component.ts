import { Component, inject, Input } from '@angular/core';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { NetworkPartnersDatatableComponent } from '../../../components/datatable-network-partners.component';
import { NetworkInvitesDatatableComponent } from '../../../components/datatable-network-invites.component';
import { Issuer } from '../../../issuer/models/issuer.model';
import { Network } from '../../../issuer/models/network.model';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { ApiNetworkInvitation } from '~/issuer/models/network-invite-api.model';

@Component({
	selector: 'network-partners',
	templateUrl: './network-partners.component.html',
	imports: [
		BgAwaitPromises,
		TranslatePipe,
		OebButtonComponent,
		NetworkPartnersDatatableComponent,
		NetworkInvitesDatatableComponent,
	],
})
export class NetworkPartnersComponent {
	@Input() partnersLoaded: Promise<unknown>;
	@Input() issuers: Issuer[];
	@Input() network: Network;
	@Input() invites: ApiNetworkInvitation[];

	pendingInvites: ApiNetworkInvitation[];

	constructor(private networkApiService: NetworkApiService) {
		// this.networkApiService.getPendingNetworkInvites(this.network.slug).then((invites) => {
		// 	console.log('invites');
		// 	this.pendingInvites = invites;
		// });
	}

	dialogRef: BrnDialogRef<any> = null;

	private readonly _hlmDialogService = inject(HlmDialogService);

	public openDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				// headerTemplate: this.headerTemplate,
				// content: this.addInstitutionsTemplate,
				variant: 'default',
				footer: false,
			},
		});
		this.dialogRef = dialogRef;

		// setTimeout(() => {
		// 	if (this.issuerSearchInputModel) {
		// 		this.issuerSearchInputModel.valueChanges
		// 			.pipe(debounceTime(500), distinctUntilChanged())
		// 			.subscribe(() => {
		// 				this.issuerSearchChange();
		// 			});
		// 	}
		// });
	}

	ngOnInit() {
		console.log('invites', this.invites);
	}
}
