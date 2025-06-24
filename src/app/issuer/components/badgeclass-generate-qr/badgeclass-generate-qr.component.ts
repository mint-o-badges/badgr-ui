import { Component, OnInit, inject } from '@angular/core';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { BadgeRequestApiService } from '../../services/badgerequest-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { DangerDialogComponent } from '../../../common/dialogs/oeb-dialogs/danger-dialog.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { DatePipe, NgIf } from '@angular/common';
import { MenuItem } from '../../../common/components/badge-detail/badge-detail.component.types';
import { saveAsImage } from '../../../common/util/qrcode-util';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { OebDropdownComponent } from '../../../components/oeb-dropdown.component';
import { SvgIconComponent } from '../../../common/components/svg-icon.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { BgImageStatusPlaceholderDirective } from '../../../common/directives/bg-image-status-placeholder.directive';
import { OebButtonComponent } from '../../../components/oeb-button.component';

@Component({
	selector: 'badgeclass-generate-qr',
	templateUrl: './badgeclass-generate-qr.component.html',
	styleUrls: ['../../../public/components/about/about.component.css'],
	imports: [
		BgAwaitPromises,
		BgBreadcrumbsComponent,
		OebDropdownComponent,
		SvgIconComponent,
		QRCodeComponent,
		BgImageStatusPlaceholderDirective,
		NgIf,
		OebButtonComponent,
		RouterLink,
		TranslatePipe,
	],
})
export class BadgeClassGenerateQrComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	static datePipe = new DatePipe('de');

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get qrSlug() {
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	badgeClass: BadgeClass;

	badgeClassLoaded: Promise<unknown>;
	crumbs: LinkEntry[];

	qrData: string;
	qrTitle: string;
	qrCodeCSS: string =
		'tw-border-solid tw-border-purple tw-border-[3px] tw-p-2 tw-rounded-2xl tw-max-w-[265px] md:tw-max-w-[350px]';
	issuer: string;
	creator: string;
	valid: boolean = true;
	validity: string;
	valid_from: Date;
	expires_at: Date;
	baseUrl: string;
	badgeRequested: boolean = false;
	editQrCodeLink: string = `/issuer/issuers/${this.issuerSlug}/badges/${this.badgeSlug}/qr/${this.qrSlug}/edit`;
	qrCodeWidth = 244;
	public qrCodeDownloadLink: SafeUrl = '';

	pdfSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

	qrCodeMenu: MenuItem[] = [
		{
			title: 'General.edit',
			icon: 'lucidePencil',
			routerLink: [this.editQrCodeLink],
		},
		{
			title: 'General.delete',
			icon: 'lucideTrash2',
			action: () => {
				this.openDangerDialog();
			},
		},
	];

	constructor(
		route: ActivatedRoute,
		router: Router,
		sessionService: SessionService,
		protected badgeClassManager: BadgeClassManager,
		protected badgeRequestApiService: BadgeRequestApiService,
		protected translate: TranslateService,
		protected qrCodeApiService: QrCodeApiService,
		protected sanitizer: DomSanitizer,
	) {
		super(router, route, sessionService);

		this.badgeClassLoaded = this.badgeClassManager
			.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
			.then((badgeClass) => {
				this.badgeClass = badgeClass;

				let im = this.badgeClass.issuerManager;
				im.issuerBySlug(this.issuerSlug).then((issuer) => {
					this.issuer = issuer.name;
				});

				this.crumbs = [
					{ title: 'Issuers', routerLink: ['/issuer'] },
					{
						// title: issuer.name,
						title: 'issuer',
						routerLink: ['/issuer/issuers', this.issuerSlug],
					},
					{
						title: 'badges',
						routerLink: ['/issuer/issuers/' + this.issuerSlug + '/badges/'],
					},
					{
						title: badgeClass.name,
						routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug],
					},
					{
						title: 'Award Badge',
						routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug, 'qr'],
					},
					{
						title: 'Generate QR',
					},
				];
			});
		this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrSlug).then((r) => {
			this.badgeRequested = r.body['requested_badges'].length > 0 ? true : false;
		});
	}

	ngOnInit() {
		this.baseUrl = window.location.origin;
		if (this.qrSlug) {
			console.log(this.qrSlug);
			this.qrCodeApiService.getQrCode(this.qrSlug).then((qrCode) => {
				this.qrTitle = qrCode.title;
				this.creator = qrCode.createdBy;
				this.valid_from = qrCode.valid_from;
				this.expires_at = qrCode.expires_at;
				if (
					//@ts-ignore
					(qrCode.expires_at && !isNaN(new Date(qrCode.expires_at))) ||
					//@ts-ignore
					(qrCode.valid_from && !isNaN(new Date(qrCode.valid_from)))
				) {
					if (
						new Date(this.valid_from) < new Date() &&
						new Date(this.expires_at) >= new Date(new Date().setHours(0, 0, 0, 0))
					) {
						this.valid = true;
					} else {
						this.valid = false;
					}

					this.validity =
						BadgeClassGenerateQrComponent.datePipe.transform(new Date(this.valid_from), 'dd.MM.yyyy') +
						' - ' +
						BadgeClassGenerateQrComponent.datePipe.transform(new Date(this.expires_at), 'dd.MM.yyyy');
				} else {
					this.validity = undefined;
				}

				if (this.valid) {
					this.qrData = `${this.baseUrl}/public/issuer/issuers/${this.issuerSlug}/badges/${this.badgeSlug}/request/${this.qrSlug}`;
				} else {
					this.qrData = 'Die Gültigkeit dieses Qr Codes ist abgelaufen.';
				}
			});
		}
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: this.translate.instant('QrCode.downloadedSuccessfully'),
				qrCodeRequested: this.badgeRequested,
				variant: 'success',
			},
		});
	}

	async savePdf(parent: any) {
		let parentElement = null;

		parentElement = parent.qrcElement.nativeElement.querySelector('canvas').toDataURL('image/png');

		if (parentElement) {
			let data = await this.getQrCodePdf(parentElement);
		}
	}

	saveQrCodeAsImage(parent) {
		saveAsImage(parent, `${this.qrTitle}-qrcode.png`);
	}

	public openDangerDialog() {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				caption: this.translate.instant('QrCode.deleteQrAward'),
				text: this.translate.instant('QrCode.deleteQrAwardConfirm'),
				delete: this.deleteQrCode.bind(this),
				qrCodeRequested: this.badgeRequested,
				variant: 'danger',
			},
		});
	}

	deleteQrCode() {
		this.qrCodeApiService.deleteQrCode(this.issuerSlug, this.badgeSlug, this.qrSlug).then(() => {
			this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
		});
	}

	async getQrCodePdf(base64QrImage: string) {
		this.qrCodeApiService.getQrCodePdf(this.qrSlug, this.badgeClass.slug, base64QrImage).subscribe({
			next: (blob: Blob) => {
				this.qrCodeApiService.downloadQrCode(blob, this.qrTitle, this.badgeClass.name);
			},
			error: (error) => {
				console.error('Error downloading the QrCode', error);
			},
		});
	}

	onChangeURL(url: SafeUrl) {
		this.qrCodeDownloadLink = url;
	}
}
