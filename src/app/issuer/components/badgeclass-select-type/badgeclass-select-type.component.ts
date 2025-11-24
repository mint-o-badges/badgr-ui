import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { HlmH1, HlmP, HlmH2 } from '@spartan-ng/helm/typography';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';
import { Network } from '~/issuer/network.model';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';

@Component({
	selector: 'badgeclass-select-type',
	templateUrl: 'badgeclass-select-type.component.html',
	styleUrls: ['./badgeclass-select-type.component.scss'],
	imports: [BgBreadcrumbsComponent, HlmH1, HlmP, HlmH2, RouterLink, TranslatePipe, BgAwaitPromises],
})
export class BadgeClassSelectTypeComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	protected title = inject(Title);
	protected messageService = inject(MessageService);
	protected issuerManager = inject(IssuerManager);
	protected badgeClassService = inject(BadgeClassManager);
	private configService = inject(AppConfigService);
	private translate = inject(TranslateService);

	issuerSlug: string;
	issuer: Issuer | Network;
	issuerLoaded: Promise<unknown>;
	breadcrumbLinkEntries: LinkEntry[] = [];
	scrolled = false;
	copiedBadgeClass: BadgeClass = null;
	/**
	 * Indicates wether the "copiedBadgeClass" is a forked copy, or a 1:1 copy
	 */
	isForked = false;

	badgesLoaded: Promise<unknown>;
	badges: BadgeClass[] = null;

	@ViewChild('badgeimage') badgeImage;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const sessionService = inject(AUTH_PROVIDER);
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route, sessionService);
		const title = this.title;

		this.translate.get('Issuer.createBadge').subscribe((str) => {
			title.setTitle(`${str} - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		});
		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerOrNetworkBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
				{ title: this.translate.instant('Issuer.createBadge') },
			];

			this.badgesLoaded = new Promise<void>((resolve, reject) => {
				this.badgeClassService.allPublicBadges$.subscribe(
					(publicBadges) => {
						this.badges = publicBadges;
						resolve();
					},
					(error) => {
						this.messageService.reportAndThrowError(`Failed to load badges`, error);
						resolve();
					},
				);
			});
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	get canCreateLp(): boolean {
		return (
			!this.issuer.is_network ||
			(this.issuer instanceof Network && this.issuer.partnerBadgesCount + this.issuer.badgeClassCount >= 2)
		);
	}
}
