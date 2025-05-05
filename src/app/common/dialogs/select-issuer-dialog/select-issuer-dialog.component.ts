import { Component, ElementRef, Renderer2 } from '@angular/core';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { BaseDialog } from '../base-dialog';

/**
 * The dialog used in the badge creation component to copy an existing badge.
 *
 * @see ForkBadgeDialog, since the ForkBadgeDialog started as an (exact) duplicate
 * of this.
 */
@Component({
	selector: 'select-issuer-dialog',
	templateUrl: 'select-issuer-dialog.component.html',
	styleUrls: ['./select-issuer-dialog.component.css'],
	standalone: false,
})
export class SelectIssuerDialog extends BaseDialog {
	Array = Array;
	resolveFunc: (Issuer) => void;
	rejectFunc: () => void;

	issuers: Issuer[] = null;
	selectedIssuer: Issuer = null;

	constructor(
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected issuerManager: IssuerManager,
		componentElem: ElementRef<HTMLElement>,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
	}

	async openDialog(): Promise<Issuer | void> {
		this.showModal();

		this.issuerManager.allIssuers$.subscribe((issuers) => {
			this.issuers = issuers.filter((issuer) => issuer.canCreateBadge);
		});

		return new Promise<Issuer | void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog(selectedIssuer?: Issuer) {
		this.closeModal();
		this.resolveFunc(selectedIssuer);
	}
}
