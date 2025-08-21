import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { HlmH1, HlmP, HlmH2 } from '@spartan-ng/helm/typography';

@Component({
	templateUrl: 'badgeclass-select-type.component.html',
	styleUrls: ['./badgeclass-select-type.component.scss'],
	imports: [BgBreadcrumbsComponent, HlmH1, HlmP, HlmH2, RouterLink, TranslatePipe],
})
export class BadgeClassSelectTypeComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	issuerSlug: string;
	issuer: Issuer;
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

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected fb: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected badgeClassService: BadgeClassManager,
		private configService: AppConfigService,
		protected dialogService: CommonDialogsService,
		private translate: TranslateService,
	) {
		super(router, route, sessionService);

		this.translate.get('Issuer.createBadge').subscribe((str) => {
			title.setTitle(`${str} - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		});
		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
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
}
