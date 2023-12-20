import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { Issuer } from '../../models/issuer.model';
import { BadgeClass } from '../../models/badgeclass.model';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';

@Component({
	selector: 'issuer-list',
	templateUrl: './issuer-list.component.html',
})
export class IssuerListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg'
	);
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	issuers: Issuer[] = null;
	badges: BadgeClass[] = null;
	issuerToBadgeInfo: { [issuerId: string]: IssuerBadgesInfo } = {};

	issuersLoaded: Promise<unknown>;
	badgesLoaded: Promise<unknown>;

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	plural = {
		issuer: {
			'=0': 'No institutions',
			'=1': '1 Institution',
			other: '# Institutions',
		},
		badges: {
			'=0': 'No badges',
			'=1': '<strong class="u-text-bold">1</strong> Badge',
			other: '<strong class="u-text-bold">#</strong> Badges',
		},
		recipient: {
			'=0': 'No recipient',
			'=1': '1 Recipient',
			other: '# Recipients',
		},
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route, loginService);
		title.setTitle(`Issuers - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.issuersLoaded = this.loadIssuers();

		this.badgesLoaded = new Promise<void>((resolve, reject) => {
			this.badgeClassService.badgesByIssuerUrl$.subscribe((badges) => {
				this.issuerToBadgeInfo = {};

				Object.keys(badges).forEach((issuerSlug) => {
					const issuerBadges = badges[issuerSlug];

					this.issuerToBadgeInfo[issuerSlug] = new IssuerBadgesInfo(
						issuerBadges.reduce((sum, badge) => sum + badge.recipientCount, 0),
						issuerBadges.sort((a, b) => b.recipientCount - a.recipientCount)
					);
				});

				resolve();
			});
		});
	}

	loadIssuers = () => {
		return new Promise<void>((resolve, reject) => {
			this.issuerManager.allIssuers$.subscribe(
				(issuers) => {
					this.issuers = issuers.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					resolve();
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load issuers', error);
					resolve();
				}
			);
		});
	};

	ngOnInit() {
		super.ngOnInit();
	}
}

class IssuerBadgesInfo {
	constructor(public totalBadgeIssuanceCount = 0, public badges: BadgeClass[] = []) {}
}
