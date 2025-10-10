import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { NgIf } from '@angular/common';
import { PublicApiIssuer } from '../../../public/models/public-api.model';
import { Issuer } from '../../../issuer/models/issuer.model';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmP, HlmH1 } from '@spartan-ng/helm/typography';
import { Network } from '~/issuer/network.model';
import { BgBreadcrumbsComponent, LinkEntry } from '../bg-breadcrumbs/bg-breadcrumbs.component';
import { NetworkApiService } from '~/issuer/services/network-api.service';
import { OebTabsComponent, Tab } from '~/components/oeb-tabs.component';
import { ApiBadgeClassNetworkShare } from '~/issuer/models/badgeclass-api.model';
import { BgBadgecard } from '../bg-badgecard';
import { firstValueFrom } from 'rxjs';
import { BadgeClassApiService } from '~/issuer/services/badgeclass-api.service';
import { BadgeClassManager } from '~/issuer/services/badgeclass-manager.service';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { Router } from '@angular/router';

@Component({
	selector: 'oeb-network-detail',
	templateUrl: './oeb-network-detail.component.html',
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH1,
		NgIf,
		HlmP,
		OebButtonComponent,
		TranslatePipe,
		RouterLink,
		BgBreadcrumbsComponent,
		OebTabsComponent,
		BgBadgecard,
	],
})
export class OebNetworkDetailComponent {
	@Input() issuers: Issuer[] | PublicApiIssuer[];
	@Input() network: Network | PublicApiIssuer;
	@Input() networkPlaceholderSrc: string;
	@Input() networkActionsMenu: any;
	@Input() public: boolean = false;
	@Output() networkDeleted = new EventEmitter();

	@ViewChild('networkTemplate', { static: true }) networkTemplate: ElementRef;
	@ViewChild('partnerTemplate', { static: true }) partnerTemplate: ElementRef;

	issuersPromise: Promise<unknown>;

	linkentries: LinkEntry[] = [];

	partnerBadges: ApiBadgeClassNetworkShare[] = [];
	networkBadges: BadgeClass[];

	tabs: Tab[] = undefined;

	activeTab = 'network';

	constructor(
		public translate: TranslateService,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		protected networkApiService: NetworkApiService,
		protected badgeClassManager: BadgeClassManager,
		protected router: Router,
	) {}

	async ngOnInit() {
		this.linkentries = [
			{ title: this.translate.instant('Network.networksNav'), routerLink: ['/catalog/networks'] },
			{
				title: this.network.name,
				routerLink: ['/public/networks/' + this.network.slug],
			},
		];
		await Promise.all([this.loadSharedBadges(), this.loadNetworkBadges()]).then(() => this.initializeTabs());
	}

	routeToUrl(url) {
		window.location.href = url;
	}

	onTabChange(tab) {
		this.activeTab = tab;
	}

	private loadSharedBadges() {
		return new Promise((res, rej) => {
			this.networkApiService.getNetworkSharedBadges(this.network.slug).then((b) => {
				this.partnerBadges = b;
				res(b);
			});
		});
	}

	transformDate(shared_at: string) {
		return new Date(shared_at);
	}

	private initializeTabs() {
		this.tabs = [
			{
				key: 'network',
				title: 'Network.networkBadges',
				icon: 'lucideShipWheel',
				count: this.partnerBadges.length,
				component: this.networkTemplate,
			},
			{
				key: 'partner',
				title: 'Issuer.partnerBadges',
				icon: 'lucideHexagon',
				component: this.partnerTemplate,
				count: this.partnerBadges.length,
			},
		];
	}

	private loadNetworkBadges() {
		return new Promise(async (res, rej) => {
			const badgesByIssuer = await firstValueFrom(
				this.badgeClassManager.getNetworkBadgesByIssuerUrl$(this.network.slug),
			);
			this.networkBadges = Object.values(badgesByIssuer).flat();
			res(this.networkBadges);
		});
	}

	routeToMemberView() {
		this.router.navigate(['/issuer/networks/', this.network.slug]);
	}
}
