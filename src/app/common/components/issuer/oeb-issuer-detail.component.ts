import { Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { MenuItem } from '../badge-detail/badge-detail.component.types';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { DangerDialogComponentTemplate } from '../../dialogs/oeb-dialogs/danger-dialog-template.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { InfoDialogComponent } from '../../dialogs/oeb-dialogs/info-dialog.component';
import { QrCodeApiService } from '../../../issuer/services/qrcode-api.service';
import { ApiQRCode } from '../../../issuer/models/qrcode-api.model';
import { SessionService } from '../../services/session.service';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { NgIf, NgFor } from '@angular/common';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebDropdownComponent } from '../../../components/oeb-dropdown.component';
import { SvgIconComponent } from '../svg-icon.component';
import { OebTabsComponent, Tab } from '../../../components/oeb-tabs.component';
import { BgAwaitPromises } from '../../directives/bg-await-promises';
import { DatatableComponent } from '../../../components/datatable-badges.component';
import { FormsModule } from '@angular/forms';
import { BgBadgecard } from '../bg-badgecard';
import { LearningPathDatatableComponent } from '../../../components/datatable-learningpaths.component';
import { BgLearningPathCard } from '../bg-learningpathcard';
import { PublicApiBadgeClass, PublicApiIssuer, PublicApiLearningPath } from '../../../public/models/public-api.model';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmH1, HlmP } from '@spartan-ng/helm/typography';
import { NgTemplateOutlet } from '@angular/common';
import { NetworkApiService } from '~/issuer/services/network-api.service';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';

interface NetworkBadgeGroup {
	issuerName: string;
	badges: BadgeResult[];
	networkIssuer?: any;
}
import { MatchingAlgorithm } from '~/common/util/matching-algorithm';

@Component({
	selector: 'oeb-issuer-detail',
	templateUrl: './oeb-issuer-detail.component.html',
	styleUrl: './oeb-issuer-detail.component.scss',
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH1,
		NgIf,
		HlmP,
		OebButtonComponent,
		RouterLink,
		OebDropdownComponent,
		SvgIconComponent,
		OebTabsComponent,
		BgAwaitPromises,
		DatatableComponent,
		FormsModule,
		HlmInput,
		NgFor,
		BgBadgecard,
		LearningPathDatatableComponent,
		BgLearningPathCard,
		TranslatePipe,
		TranslateModule,
		NgTemplateOutlet,
	],
})
export class OebIssuerDetailComponent implements OnInit {
	@Input() issuer: Issuer | PublicApiIssuer;
	@Input() issuerPlaceholderSrc: string;
	@Input() issuerActionsMenu: any;
	@Input() badges: BadgeClass[] | PublicApiBadgeClass[];
	@Input() learningPaths: (ApiLearningPath | PublicApiLearningPath)[];
	@Input() networks: PublicApiIssuer[];
	@Input() public: boolean = false;
	@Output() issuerDeleted = new EventEmitter();

	learningPathsPromise: Promise<unknown>;
	requestsLoaded: Promise<Map<string, ApiQRCode[]>>;
	networkRequestsLoaded: Promise<Map<string, ApiQRCode[]>>;
	userIsMember = false;

	constructor(
		private router: Router,
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		protected entityManager: CommonEntityManager,
		private configService: AppConfigService,
		private learningPathApiService: LearningPathApiService,
		private qrCodeApiService: QrCodeApiService,
		private sessionService: SessionService,
		private networkApiService: NetworkApiService,
	) {
		if (this.sessionService.isLoggedIn) {
			this.issuerManager.myIssuers$.subscribe((issuers) => {
				this.userIsMember = issuers.some((i) => this.issuer.slug == i.slug);
			});
		}
	}

	private readonly _hlmDialogService = inject(HlmDialogService);

	isFullIssuer(issuer: Issuer | PublicApiIssuer): issuer is Issuer {
		return 'currentUserStaffMember' in issuer;
	}

	menuItemsPublic: MenuItem[] = [
		{
			title: 'Issuer.jsonView',
			action: (a: any) => this.routeToJson(),
			// action: (a:any) => this.delete(a),
			icon: 'lucideFileQuestion',
		},
	];

	menuItems: MenuItem[] = [
		{
			title: 'General.edit',
			routerLink: ['./edit'],
			icon: 'lucidePencil',
		},
		{
			title: 'General.delete',
			// routerLink: ['/catalog/badges'],
			action: (a: any) => this.delete(a),
			icon: 'lucideTrash2',
		},
		{
			title: 'General.members',
			routerLink: ['./staff'],
			icon: 'lucideUsers',
		},
	];

	tabs: Tab[] = undefined;
	activeTab = 'badges';

	badgeTemplateTabs: any = undefined;
	activeTabBadgeTemplate = 'issuer-badges';

	@ViewChild('badgesTemplate', { static: false }) badgesTemplate: ElementRef;
	@ViewChild('learningPathTemplate', { static: false }) learningPathTemplate: ElementRef;

	@ViewChild('issuerBadgesTemplate', { static: true }) issuerBadgesTemplate: ElementRef;
	@ViewChild('networkBadgesTemplate', { static: true }) networkBadgesTemplate: ElementRef;

	ngAfterViewInit() {
		this.tabs = [
			{
				key: 'badges',
				title: 'Badges',
				component: this.badgesTemplate,
			},
			{
				key: 'micro-degrees',
				title: 'Micro Degrees',
				component: this.learningPathTemplate,
			},
		];
	}

	badgeResults: BadgeResult[] = [];
	networkBadgeInstanceResults: NetworkBadgeGroup[] = [];
	maxDisplayedResults = 100;

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	/**
	 * Property used for rendering <learningpaths-datatable /> which is only
	 * available if we are working with the non-public ApiLearningPaths
	 * of an issuer. Therefore this remains null when public.
	 */
	get apiLearningPaths() {
		return this.public ? null : (this.learningPaths as ApiLearningPath[]);
	}

	private async updateResults() {
		// Clear Results
		this.badgeResults.length = 0;

		// The promise only exists for the bgAwaitPromises to work in the template
		if (this.sessionService.isLoggedIn) {
			this.requestsLoaded = Promise.all(
				this.badges.map((b) =>
					this.qrCodeApiService
						.getQrCodesForIssuerByBadgeClass(b.issuerSlug, b.slug)
						.then((p) => ({ key: b.slug, value: p })),
				),
			).then((d) =>
				d.reduce((map, obj) => {
					map.set(obj.key, obj.value);
					return map;
				}, new Map<string, ApiQRCode[]>()),
			);
		}
		const requestMap = await this.requestsLoaded;

		const addBadgeToResults = async (badge: BadgeClass) => {
			// Restrict Length
			if (this.badgeResults.length > this.maxDisplayedResults) {
				return false;
			}
			if (badge.extension && badge.extension['extensions:CategoryExtension'].Category === 'learningpath') {
				return false;
			}

			this.badgeResults.push(new BadgeResult(badge, this.issuer.name, this.getRequestCount(badge, requestMap)));

			return true;
		};

		this.badges.filter(MatchingAlgorithm.badgeMatcher(this._searchQuery)).forEach(addBadgeToResults);
		this.badgeResults.sort((a, b) => b.badge.createdAt.getTime() - a.badge.createdAt.getTime());
	}

	private async updateNetworkResults() {
		try {
			this.networkBadgeInstanceResults.length = 0;

			const networkBadgeGroups: any = await this.networkApiService.getIssuerNetworkBadges(this.issuer.slug);
			if (!networkBadgeGroups || networkBadgeGroups.length === 0) {
				return;
			}

			const allBadgeClasses: BadgeClass[] = [];
			for (const group of networkBadgeGroups) {
				for (const networkBadgeClass of group.badge_classes) {
					const badgeClass = new BadgeClass(this.entityManager, networkBadgeClass);
					allBadgeClasses.push(badgeClass);
				}
			}

			let requestMap = new Map<string, ApiQRCode[]>();
			if (this.sessionService.isLoggedIn && allBadgeClasses.length > 0) {
				this.networkRequestsLoaded = Promise.all(
					allBadgeClasses.map((badge) =>
						this.qrCodeApiService
							.getQrCodesForIssuerByBadgeClass(badge.issuerSlug, badge.slug)
							.then((p) => ({ key: badge.slug, value: p }))
							.catch(() => ({ key: badge.slug, value: [] })),
					),
				).then((d) =>
					d.reduce((map, obj) => {
						map.set(obj.key, obj.value);
						return map;
					}, new Map<string, ApiQRCode[]>()),
				);

				requestMap = await this.networkRequestsLoaded;
			}

			for (const group of networkBadgeGroups) {
				const groupBadges: BadgeResult[] = [];

				for (const networkBadgeClass of group.badge_classes) {
					const badgeClass = new BadgeClass(this.entityManager, networkBadgeClass);

					const requestCount = requestMap.get(badgeClass.slug)?.length ?? 0;

					const badgeResult = new BadgeResult(badgeClass, group.network_issuer.name, requestCount);

					groupBadges.push(badgeResult);
				}

				groupBadges.sort((a, b) => b.badge.createdAt.getTime() - a.badge.createdAt.getTime());

				this.networkBadgeInstanceResults.push({
					issuerName: group.network_issuer.name,
					badges: groupBadges,
					networkIssuer: group.network_issuer,
				});
			}

			this.networkBadgeInstanceResults.sort((a, b) => {
				const aTime = a.badges[0]?.badge.createdAt.getTime() ?? 0;
				const bTime = b.badges[0]?.badge.createdAt.getTime() ?? 0;
				return bTime - aTime;
			});
		} catch (error) {
			console.error('Error loading network badge groups:', error);
		}
	}

	async ngOnInit() {
		await Promise.all([this.updateResults(), this.updateNetworkResults()]);
		if (!this.public) this.getLearningPathsForIssuerApi(this.issuer.slug);
		this.badgeTemplateTabs = [
			{
				key: 'issuer-badges',
				title: 'Issuer.issuerBadges',
				count: this.badgeResults.length,
				img: this.issuer.image,
			},
			{
				key: 'network-badges',
				title: 'Issuer.badgesInNetworks',
				count: this.networkBadgeInstanceResults.length,
				icon: 'lucideShipWheel',
			},
		];
	}

	delete(event) {
		this.issuerDeleted.emit(event);
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
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if (badge.recipientCount === 0 && qrCodes.length === 0) {
				const dialogRef = this._hlmDialogService.open(InfoDialogComponent, {
					context: {
						variant: 'info',
						caption: this.translate.instant('Badge.endOfEditDialogTitle'),
						subtitle: this.translate.instant('Badge.endOfEditDialogText'),
						text: this.translate.instant('Badge.endOfEditDialogSubText'),
						cancelText: this.translate.instant('General.cancel'),
						forwardText: this.translate.instant('Issuer.giveBadge'),
					},
				});
				dialogRef.closed$.subscribe((result) => {
					if (result === 'continue')
						this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
				});
			} else {
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
			}
		});
	}

	routeToQRCodeAward(badge, issuer) {
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if (badge.recipientCount === 0 && qrCodes.length === 0) {
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
	redirectToLearningPathDetail(learningPathSlug, issuer) {
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'learningpaths', learningPathSlug]);
	}

	public deleteLearningPath(learningPathSlug, issuer) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponentTemplate, {
			context: {
				delete: () => this.deleteLearningPathApi(learningPathSlug, issuer),
				// qrCodeRequested: () => {},
				variant: 'danger',
				text: 'Möchtest du diesen Micro Degree wirklich löschen?',
				title: this.translate.instant('LearningPath.deleteMd'),
			},
		});
	}

	deleteLearningPathApi(learningPathSlug, issuer) {
		this.learningPathApiService
			.deleteLearningPath(issuer.slug, learningPathSlug)
			.then(() => (this.learningPaths = this.learningPaths.filter((value) => value.slug != learningPathSlug)));
	}

	getLearningPathsForIssuerApi(issuerSlug) {
		this.learningPathsPromise = this.learningPathApiService
			.getLearningPathsForIssuer(issuerSlug)
			.then(
				(learningPaths) =>
					(this.learningPaths = learningPaths.sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					)),
			);
	}

	get rawJsonUrl() {
		if (this.issuer) return `${this.configService.apiConfig.baseUrl}/public/issuers/${this.issuer.slug}.json`;
	}

	routeToJson() {
		window.open(`${this.configService.apiConfig.baseUrl}/public/issuers/${this.issuer.slug}.json`, '_blank');
	}

	routeToMemberView() {
		this.router.navigate(['/issuer/issuers/', this.issuer.slug]);
	}

	routeToUrl(url) {
		window.location.href = url;
	}

	onTabChange(tab) {
		this.activeTab = tab;
	}

	onNestedTabChange(tab) {
		this.activeTabBadgeTemplate = tab;
	}

	calculateStudyLoad(lp: any): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}
}

export class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
		public requestCount: number,
	) {}
}
