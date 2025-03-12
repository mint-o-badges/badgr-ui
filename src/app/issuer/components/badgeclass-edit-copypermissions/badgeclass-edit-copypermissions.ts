import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { typedFormGroup } from '../../../common/util/typed-forms';
import { BadgeClassCopyPermissions } from '../../models/badgeclass-api.model';

@Component({
	templateUrl: 'badgeclass-edit-copypermissions.component.html',
	styleUrl: './badgeclass-edit-copypermissions.component.css',
})
export class BadgeClassEditCopyPermissionsComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	issuerSlug: string;
	badgeSlug: string;
	category: string
	issuer: Issuer;
	issuerLoaded: Promise<unknown>;
	badgeClass: BadgeClass;
	badgeClassLoaded: Promise<unknown>;
	breadcrumbLinkEntries: LinkEntry[] = [];


	@ViewChild('formElem')
	formElem: ElementRef<HTMLFormElement>;

	badgeClassForm = typedFormGroup()
		.addControl('copy_permissions_allow_others', false)
	;

	savePromise: Promise<BadgeClass> | null = null;

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected fb: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected badgeManager: BadgeClassManager,
		private configService: AppConfigService,
		protected dialogService: CommonDialogsService,
		private translate: TranslateService,
	) {
		super(router, route, sessionService);
		this.translate.get('Badge.copyBadgeHeadline').subscribe((str) => {
			title.setTitle(`${str} - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		});

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];
		this.badgeSlug = this.route.snapshot.params['badgeSlug'];

		this.badgeClassLoaded = badgeManager.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug).then(
			(badgeClass) => {
				this.badgeClass = badgeClass;
				this.badgeClassForm.setValue({
					copy_permissions_allow_others: badgeClass.canCopy('others'),
				});
			},
			(error) =>
				this.messageService.reportLoadingError(
					`Cannot find badge ${this.issuerSlug} / ${this.badgeSlug}`,
					error,
				),
		);

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
			this.breadcrumbLinkEntries = [
				{ title: 'Issuers', routerLink: ['/issuer'] },
				{ title: this.issuer.name, routerLink: ['/issuer/issuers', this.issuerSlug] },
				{ title: this.translate.instant('Badge.copyBadgeHeadline') },
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

	cancelClicked() {
		this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeClass.slug]);
	}

	async onSubmit() {
		const formState = this.badgeClassForm.value;
		const copy_permissions: BadgeClassCopyPermissions[] = ['issuer'];
		if (formState.copy_permissions_allow_others) { copy_permissions.push('others'); }
		this.badgeClass.copyPermissions = copy_permissions;
		try {
			this.savePromise = this.badgeClass.save();
			await this.savePromise;
		} catch(e) {
			this.messageService.reportAndThrowError(
				`Unable to save Badge Class: ${BadgrApiFailure.from(e).firstMessage}`,
				e,
			);
		}

		this.cancelClicked();
	}
}
