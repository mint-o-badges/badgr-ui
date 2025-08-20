import { Component, inject, Input } from '@angular/core';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
	selector: 'network-partners',
	templateUrl: './network-partners.component.html',
	imports: [BgAwaitPromises, TranslatePipe, OebButtonComponent],
})
export class NetworkPartnersComponent {
	@Input() partnersLoaded: Promise<unknown>;

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
}
