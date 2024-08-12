import { Component, Input, OnInit, SimpleChanges, inject } from "@angular/core";
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../components/spartan/ui-accordion-helm/src';
import { HlmIconModule } from '../../../components/spartan/ui-icon-helm/src';
import { TranslateModule } from "@ngx-translate/core";
import { RouterModule } from "@angular/router";
import { NgFor, NgIf, NgClass } from "@angular/common";
import { OebSeparatorComponent } from "../../../components/oeb-separator.component";
import { OebButtonComponent } from "../../../components/oeb-button.component";
import { OebDropdownComponent } from "../../../components/oeb-dropdown.component";
import { BadgeRequestApiService } from "../../services/badgerequest-api.service";
import { QrCodeDatatableComponent } from "../../../components/datatable-qrcodes.component";
import type { MenuItem } from "../../../../app/common/components/badge-detail/badge-detail.component.types";
import { SharedIconsModule } from "../../../../app/public/icons.module";
import { BadgrCommonModule } from "../../../../app/common/badgr-common.module";
import { HlmDialogService } from "../../../../app/components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { DangerDialogComponent } from "../../../../app/common/dialogs/oeb-dialogs/danger-dialog.component";
import { QrCodeApiService } from "../../services/qrcode-api.service";
import { ApiQRCode } from "../../models/qrcode-api.model";

@Component({
	selector: 'qrcode-awards',
	templateUrl: './qrcode-awards.component.html',
    standalone: true,
    providers: [BadgeRequestApiService, HlmDialogService, QrCodeApiService],
    imports: [
		HlmAccordionModule,
		HlmIconModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
		NgIf,
		NgFor,
		NgClass,
		OebSeparatorComponent,
		OebButtonComponent,
		OebDropdownComponent,
		QrCodeDatatableComponent,
		SharedIconsModule,
		BadgrCommonModule,
		DangerDialogComponent
	],
})

export class QrCodeAwardsComponent {

	constructor(
		private badgeRequestApiService: BadgeRequestApiService,
		private qrCodeApiService: QrCodeApiService,) {}
	separatorStyle = "tw-block tw-my-2 tw-border-[var(--color-lightgray)]"

	getSvgFillColor(int: number) {
		if (int === 0) {
			return "white"
		}else{
			return "var(--color-purple)"
		}
	}

    @Input() awards: any[]
	@Input() routerLink: string[]
	@Input() issuerSlug: string
	@Input() badgeClassSlug: string

	requestedBadges: any[] = []

	qrCodeMenus: Array<MenuItem[]> = []

	ngOnChanges(changes: SimpleChanges){
		if(changes.awards){
			this.awards.forEach((award) => {
				this.qrCodeMenus.push([
					{
						title: 'Zum QR-Code',
						routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeClassSlug, 'qr', award.slug,  'generate'],
						icon: 'lucideQrCode',
					},
					{
						title: 'Bearbeiten',
						routerLink: ['/issuer/issuers/' , this.issuerSlug, 'badges' , this.badgeClassSlug, 'qr', award.slug, 'edit'],
						icon: 'lucidePencil',
					},
					{
						title: 'Löschen',
						action: () => this.openDangerDialog(award.slug),
						icon: 'lucideTrash2',
					},
				])
			})
		}
	}

	private readonly _hlmDialogService = inject(HlmDialogService);


	public openDangerDialog(qrSlug: string) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				delete: () => this.deleteQrCode(qrSlug),
				variant: "danger"
			},
		});
	}

	deleteQrCode(qrSlug: string) {
		this.qrCodeApiService.deleteQrCode(this.issuerSlug, this.badgeClassSlug, qrSlug).then(() => {
			this.awards = this.awards.filter(value => value.slug != qrSlug)
		}
	)};

}