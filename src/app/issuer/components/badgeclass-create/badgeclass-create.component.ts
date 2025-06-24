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
import { LinkEntry, BgBreadcrumbsComponent } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { NgIf } from '@angular/common';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { BadgeClassEditFormComponent } from '../badgeclass-edit-form/badgeclass-edit-form.component';

@Component({
    templateUrl: 'badgeclass-create.component.html',
    imports: [
        BgBreadcrumbsComponent,
        HlmH1Directive,
        NgIf,
        BgAwaitPromises,
        BadgeClassEditFormComponent,
        TranslatePipe,
    ],
})
export class BadgeClassCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	issuerSlug: string;
	category: string;
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
		this.category = this.route.snapshot.params['category'];

		const breadcrumbPromises: Promise<unknown>[] = [];
		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
		});
		breadcrumbPromises.push(this.issuerLoaded);

		const state = this.router.getCurrentNavigation().extras.state;
		if (state && state.copybadgeid) {
			breadcrumbPromises.push(
				this.badgeClassService.issuerBadgeById(state.copybadgeid).then((badge) => {
					this.category = badge.extension['extensions:CategoryExtension'].Category;
					this.copiedBadgeClass = badge;
				}),
			);
		}

		Promise.all(breadcrumbPromises).then(() => {
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: this.issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
				{
					title: this.copiedBadgeClass
						? this.translate.instant('Badge.copyBadge')
						: this.translate.instant('Issuer.createBadge'),
				},
			];
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

	// copyBadge() {
	// 	this.dialogService.copyBadgeDialog
	// 		.openDialog(this.badges)
	// 		.then((data: BadgeClass | void) => {
	// 			if (data) {
	// 				this.copiedBadgeClass = data;
	// 				this.isForked = false;
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			this.messageService.reportAndThrowError('Failed to load badges to copy', error);
	// 		});
	// }

	// forkBadge() {
	// 	this.dialogService.forkBadgeDialog
	// 		.openDialog(this.badges)
	// 		.then((data: BadgeClass | void) => {
	// 			if (data) {
	// 				this.copiedBadgeClass = data;
	// 				this.isForked = true;
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			this.messageService.reportAndThrowError('Failed to load badges to fork', error);
	// 		});
	// }
}
