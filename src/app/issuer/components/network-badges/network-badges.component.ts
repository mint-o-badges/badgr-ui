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
import { QrCodeApiService } from '~/issuer/services/qrcode-api.service';

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
		private qrCodeApiService: QrCodeApiService,
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
	requestsLoaded: Promise<Map<string, ApiQRCode[]>>;

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

	private initializeTabs() {
		this.tabs = [
			{
				key: 'network',
				title: 'Network.networkBadges',
				icon: 'lucideShipWheel',
				count: this.badges.length,
				component: this.networkTemplate,
			},
			{
				key: 'partner',
				title: 'Partner-Badges',
				icon: 'lucideHexagon',
				component: this.partnerTemplate,
			},
		];
	}

	async ngOnInit() {
		try {
			await this.loadBadgesAndRequests();
			this.initializeTabs();
		} catch (error) {
			this.messageService.reportAndThrowError(
				`Failed to load badges for ${this.network() ? this.network().name : this.network().slug}`,
				error,
			);
		}
	}

	private async loadBadgesAndRequests() {
		const badgesByIssuer = await firstValueFrom(this.badgeClassService.badgesByIssuerUrl$);
		this.badges = this.sortBadgesByCreatedAt(badgesByIssuer[this.network().issuerUrl] || []);

		const requestMap = await this.loadRequestsForBadges(this.badges);

		this.badgeResults = this.badges.map((badge) => ({
			badge,
			requestCount: this.getRequestCount(badge, requestMap),
		}));
	}

	private sortBadgesByCreatedAt(badges: any[]) {
		const cmp = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
		return badges.sort((a, b) => cmp(b.createdAt, a.createdAt));
	}

	private async loadRequestsForBadges(badges: any[]): Promise<Map<string, ApiQRCode[]>> {
		const requestPromises = badges.map((badge) =>
			this.qrCodeApiService
				.getQrCodesForIssuerByBadgeClass(badge.issuerSlug, badge.slug)
				.then((requests) => ({ key: badge.slug, value: requests })),
		);

		const requestData = await Promise.all(requestPromises);

		return requestData.reduce((map, { key, value }) => {
			map.set(key, value);
			return map;
		}, new Map<string, ApiQRCode[]>());
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
		this.dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerTemplate,
				content: this.issuerSelection,
			},
		});
		this.dialogRef.closed$.subscribe((result) => {
			if (result === 'continue')
				this.router.navigate(['/issuer/issuers/', this.selectedIssuer.slug, 'badges', badge.slug, 'issue']);
		});
	}

	routeToQRCodeAward(badge, issuer) {
		this.dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerTemplate,
				content: this.issuerSelection,
			},
		});
		this.dialogRef.closed$.subscribe((result) => {
			if (result === 'continue')
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr'], {
					queryParams: {
						partnerIssuer: this.selectedIssuer.slug,
						isNetworkBadge: true,
					},
				});
		});
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
		this.closeDialog();
		this.router.navigate(['/issuer/issuers', issuer.slug, 'badges', 'create']);
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	closeDialogContinue() {
		this.dialogRef.close('continue');
	}
}
