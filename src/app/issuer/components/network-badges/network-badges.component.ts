import { Component, ElementRef, inject, input, Input, output, signal, TemplateRef, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { NetworkApiService } from '../../../issuer/services/network-api.service';
import { OebTabsComponent } from '~/components/oeb-tabs.component';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';
import { Route, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BadgeClassManager } from '~/issuer/services/badgeclass-manager.service';
import { MessageService } from '~/common/services/message.service';
import { Network } from '~/issuer/network.model';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { DatatableComponent, type DatatableBadgeResult } from '~/components/datatable-badges.component';
import { ApiQRCode } from '~/issuer/models/qrcode-api.model';
import { HlmDialogService } from '~/components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogComponent } from '~/components/dialog.component';
import { Issuer } from '~/issuer/models/issuer.model';
import { IssuerManager } from '~/issuer/services/issuer-manager.service';
import { UserProfileManager } from '~/common/services/user-profile-manager.service';
import { FormsModule } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
	selector: 'network-badges',
	templateUrl: './network-badges.component.html',
	imports: [
		TranslatePipe,
		OebButtonComponent,
		OebTabsComponent,
		BgAwaitPromises,
		RouterLink,
		DatatableComponent,
		FormsModule,
	],
})
export class NetworkBadgesComponent {
	constructor(
		private networkApiService: NetworkApiService,
		private badgeClassService: BadgeClassManager,
		private userProfileManager: UserProfileManager,
		private issuerManager: IssuerManager,
		private messageService: MessageService,
		private translate: TranslateService,
		private router: Router,
	) {
		this.userProfileManager.userProfilePromise.then((profile) => {
			profile.emails.loadedPromise.then(() => {
				this.issuerManager.myIssuers$.subscribe((issuers) => {
					this.userIssuers = issuers.filter((issuer) => issuer.canCreateBadge);
				});
			});
		});
	}

	network = input.required<Network>();
	badgesLoaded: Promise<unknown>;

	userIssuers: Issuer[] = [];

	badges: BadgeClass[] = [];

	badgeResults: DatatableBadgeResult[] = [];

	selectedIssuer: Issuer = null;
	dialogRef: BrnDialogRef<unknown> = null;

	tabs: any = undefined;

	activeTab = 'network';

	@ViewChild('networkTemplate', { static: true }) networkTemplate: ElementRef;
	@ViewChild('partnerTemplate', { static: true }) partnerTemplate: ElementRef;

	@ViewChild('issuerSelection')
	issuerSelection: TemplateRef<void>;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	private readonly _hlmDialogService = inject(HlmDialogService);

	ngOnInit() {
		this.badgesLoaded = firstValueFrom(this.badgeClassService.badgesByIssuerUrl$)
			.then((badgesByIssuer) => {
				const cmp = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
				this.badges = (badgesByIssuer[this.network().networkUrl] || []).sort((a, b) =>
					cmp(b.createdAt, a.createdAt),
				);
				this.badges.forEach((b) => {
					this.badgeResults.push({ badge: b, requestCount: 0 });
				});
			})
			.catch((error) => {
				this.messageService.reportAndThrowError(
					`Failed to load badges for ${this.network() ? this.network().name : this.network().slug}`,
					error,
				);
			});
	}

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

	getRequestCount(badge: BadgeClass, requestMap: Map<string, ApiQRCode[]>): number {
		if (requestMap?.has(badge.slug)) {
			const qrCode = requestMap.get(badge.slug);
			if (qrCode.length) {
				return qrCode.reduce((sum, code) => sum + code.request_count, 0);
			}
			return 0;
		}
	}

	routeToBadgeAward(badge: BadgeClass, issuer) {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerTemplate,
				content: this.issuerSelection,
			},
		});
		dialogRef.closed$.subscribe((result) => {
			if (result === 'continue')
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
		});
	}

	routeToQRCodeAward(badge, issuer) {
		// 	this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
		// 		if (badge.recipientCount === 0 && qrCodes.length === 0) {
		// 			const dialogRef = this._hlmDialogService.open(InfoDialogComponent, {
		// 				context: {
		// 					variant: 'info',
		// 					caption: this.translate.instant('Badge.endOfEditDialogTitle'),
		// 					subtitle: this.translate.instant('Badge.endOfEditDialogTextQR'),
		// 					text: this.translate.instant('Badge.endOfEditDialogSubText'),
		// 					cancelText: this.translate.instant('General.previous'),
		// 					forwardText: this.translate.instant('Issuer.giveQr'),
		// 				},
		// 			});
		// 			dialogRef.closed$.subscribe((result) => {
		// 				if (result === 'continue')
		// 					this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
		// 			});
		// 		} else {
		// 			this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
		// 		}
		// 	});
	}

	routeToBadgeDetail(badge, issuer, focusRequests: boolean = false) {
		const extras = focusRequests
			? {
					queryParams: { focusRequests: 'true' },
				}
			: {};

		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug], extras);
	}

	routeToBadgeCreation(issuer: Issuer) {
		console.log('issuer', issuer);
		this.closeDialog();
		this.router.navigate(['/issuer/issuers', issuer.slug, 'badges', 'create']);
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}
}
