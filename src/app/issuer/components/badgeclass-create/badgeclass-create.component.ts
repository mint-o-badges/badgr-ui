import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    templateUrl: 'badgeclass-create.component.html',
    standalone: false
})
export class BadgeClassCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
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
		title.setTitle(`Create Badge - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
				{ title: 'Create Badge' },
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

	badgeClassCreated(promise: Promise<BadgeClass>) {
		promise.then(
			(badgeClass) => this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug]),
			(error) =>
				this.messageService.reportAndThrowError(
					`Unable to create Badge Class: ${BadgrApiFailure.from(error).firstMessage}`,
					error,
				),
		);
	}
	creationCanceled() {
		this.router.navigate(['issuer/issuers', this.issuerSlug]);
	}

	@HostListener('window:scroll')
	onWindowScroll() {
		var top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		this.scrolled = this.badgeImage && top > this.badgeImage.componentElem.nativeElement.offsetTop;
	}

	copyBadge() {
		this.dialogService.copyBadgeDialog
			.openDialog(this.badges)
			.then((data: BadgeClass | void) => {
				if (data) {
					this.copiedBadgeClass = data;
					this.isForked = false;
				}
			})
			.catch((error) => {
				this.messageService.reportAndThrowError('Failed to load badges to copy', error);
			});
	}

	forkBadge() {
		this.dialogService.forkBadgeDialog
			.openDialog(this.badges)
			.then((data: BadgeClass | void) => {
				if (data) {
					this.copiedBadgeClass = data;
					this.isForked = true;
				}
			})
			.catch((error) => {
				this.messageService.reportAndThrowError('Failed to load badges to fork', error);
			});
	}
}
