import { NgIcon } from '@ng-icons/core';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { BrnAccordionContentComponent } from '@spartan-ng/brain/accordion';
import { HlmAccordionModule } from '../../../components/spartan/ui-accordion-helm/src';
import { HlmIconModule } from '../../../components/spartan/ui-icon-helm/src';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { OebSeparatorComponent } from '../../../components/oeb-separator.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebDropdownComponent } from '../../../components/oeb-dropdown.component';
import { BadgeRequestApiService } from '../../services/badgerequest-api.service';
import { QrCodeDatatableComponent } from '../../../components/datatable-qrcodes.component';
import type { MenuItem } from '../../../../app/common/components/badge-detail/badge-detail.component.types';
import { SharedIconsModule } from '../../../../app/public/icons.module';
import { BadgrCommonModule } from '../../../../app/common/badgr-common.module';
import { HlmDialogService } from '../../../../app/components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DangerDialogComponent } from '../../../../app/common/dialogs/oeb-dialogs/danger-dialog.component';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { ApiQRCode } from '../../models/qrcode-api.model';
import { HlmH3Directive } from '../../../../app/components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';

import { TranslateService } from '@ngx-translate/core';
import { InfoDialogComponent } from '../../../common/dialogs/oeb-dialogs/info-dialog.component';
import { BadgeClass } from '../../models/badgeclass.model';
import { Router } from '@angular/router';
import { Issuer } from '../../models/issuer.model';

@Component({
	selector: 'qrcode-awards',
	templateUrl: './qrcode-awards.component.html',
	providers: [BadgeRequestApiService, HlmDialogService, QrCodeApiService, TranslateService],
	imports: [
    HlmAccordionModule,
    NgIcon,
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
    HlmH3Directive
],
})
export class QrCodeAwardsComponent {
	constructor(
		private badgeRequestApiService: BadgeRequestApiService,
		private qrCodeApiService: QrCodeApiService,
		private router: Router,
		private translate: TranslateService,
	) {}
	separatorStyle = 'tw-block tw-my-2 tw-border-[var(--color-lightgray)]';

	getSvgFillColor(int: number) {
		if (int === 0) {
			return 'white';
		} else {
			return 'var(--color-purple)';
		}
	}

	@Input() awards: any[];
	@Input() routerLinkText: string[];
	@Input() issuer: Issuer;
	@Input() badgeClass: BadgeClass;
	@Output() qrBadgeAward = new EventEmitter<void>();

	requestedBadges: any[] = [];

	qrCodeMenus: Array<MenuItem[]> = [];

	ngOnChanges(changes: SimpleChanges) {
		if (changes.awards) {
			this.awards.forEach((award) => {
				this.qrCodeMenus.push([
					{
						title: 'Zum QR-Code',
						routerLink: [
							'/issuer/issuers',
							this.issuer.slug,
							'badges',
							this.badgeClass.slug,
							'qr',
							award.slug,
							'generate',
						],
						icon: 'lucideQrCode',
					},
					{
						title: 'Bearbeiten',
						routerLink: [
							'/issuer/issuers/',
							this.issuer.slug,
							'badges',
							this.badgeClass.slug,
							'qr',
							award.slug,
							'edit',
						],
						icon: 'lucidePencil',
					},
					{
						title: 'Löschen',
						action: () => this.openDangerDialog(award.slug),
						icon: 'lucideTrash2',
					},
				]);
			});
		}
	}

	private readonly _hlmDialogService = inject(HlmDialogService);

	public openDangerDialog(qrSlug: string) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				caption: this.translate.instant('QrCode.deleteQrAward'),
				text: this.translate.instant('QrCode.deleteQrAwardConfirm'),
				delete: () => this.deleteQrCode(qrSlug),
				qrCodeRequested: this.awards.find((award) => award.slug == qrSlug).request_count > 0,
				variant: 'danger',
			},
		});
	}

	routeToQrAward(badge: BadgeClass, issuer) {
		if (badge.recipientCount === 0) {
			const dialogRef = this._hlmDialogService.open(InfoDialogComponent, {
				context: {
					variant: 'info',
					caption: this.translate.instant('Badge.endOfEditDialogTitle'),
					subtitle: this.translate.instant('Badge.endOfEditDialogTextQR'),
					text: this.translate.instant('Badge.endOfEditDialogSubText'),
					cancelText: this.translate.instant('General.previous'),
					forwardText: this.translate.instant('Issuer.giveQr'),
				},
			});
			dialogRef.closed$.subscribe((result) => {
				if (result === 'continue')
					this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
			});
		} else {
			this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
		}
	}

	deleteQRAward(data) {
		let index = this.awards.findIndex((award) => award.slug == data.slug);
		this.awards[index].request_count -= 1;
	}

	deleteQrCode(qrSlug: string) {
		this.qrCodeApiService.deleteQrCode(this.issuer.slug, this.badgeClass.slug, qrSlug).then(() => {
			this.awards = this.awards.filter((value) => value.slug != qrSlug);
		});
	}

	onQrBadgeAward() {
		this.qrBadgeAward.emit();
	}
}
