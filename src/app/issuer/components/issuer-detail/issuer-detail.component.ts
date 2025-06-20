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
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { ApiExternalToolLaunchpoint } from '../../../externaltools/models/externaltools-api.model';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { MenuItem } from '../../../common/components/badge-detail/badge-detail.component.types';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { first, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'issuer-detail',
	templateUrl: './issuer-detail.component.html',
	standalone: false,
})
export class IssuerDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlaceHolderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	issuer: Issuer;
	issuerSlug: string;
	badges: BadgeClass[];
	learningPaths: ApiLearningPath[];
	launchpoints: ApiExternalToolLaunchpoint[];

	profileEmails: UserProfileEmail[] = [];

	issuerLoaded: Promise<unknown>;
	badgesLoaded: Promise<unknown>;
	learningPathsLoaded: Promise<unknown>;

	profileEmailsLoaded: Promise<unknown>;
	crumbs: LinkEntry[];

	menuitems: MenuItem[] = [];

	myInstitutions = 'Meine Institutionen';

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected badgeClassService: BadgeClassManager,
		protected learningPathsService: LearningPathApiService,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
		private externalToolsManager: ExternalToolsManager,
		private dialogService: CommonDialogsService,
		private translate: TranslateService,
	) {
		super(router, route, loginService);

		title.setTitle(`Issuer Detail - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.externalToolsManager.getToolLaunchpoints('issuer_external_launch').then((launchpoints) => {
			this.launchpoints = launchpoints.filter((lp) => Boolean(lp));
		});

		this.menuitems = [
			{
				title: this.translate.instant('General.edit'),
				routerLink: ['./edit'],
				icon: 'lucidePencil',
			},
			{
				title: this.translate.instant('General.delete'),
				action: ($event) => this.delete($event),
				icon: 'lucideTrash2',
			},
			{
				title: this.translate.instant('Issuer.editMembers'),
				routerLink: ['./staff'],
				icon: 'lucideUsers',
			},
		];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;
				this.title.setTitle(
					`Issuer - ${this.issuer.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
				this.crumbs = [
					{ title: this.translate.instant('NavItems.myInstitutions'), routerLink: ['/issuer/issuers'] },
					{ title: this.issuer.name, routerLink: ['/issuer/issuers/' + this.issuer.slug] },
				];

				this.badgesLoaded = firstValueFrom(this.badgeClassService.badgesByIssuerUrl$)
					.then((badgesByIssuer) => {
						const cmp = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
						this.badges = (badgesByIssuer[this.issuer.issuerUrl] || []).sort((a, b) =>
							cmp(b.createdAt, a.createdAt),
						);
					})
					.catch((error) => {
						this.messageService.reportAndThrowError(
							`Failed to load badges for ${this.issuer ? this.issuer.name : this.issuerSlug}`,
							error,
						);
					});
			},
			(error) => {
				this.messageService.reportLoadingError(
					`Issuer '${this.issuerSlug}' does not exist or you are not allowed to view the issuer`,
					error,
				);
			},
		);

		this.profileEmailsLoaded = this.profileManager.userProfilePromise
			.then((profile) => profile.emails.loadedPromise)
			.then((emails) => (this.profileEmails = emails.entities));
	}

	delete = ($event: Event) => {
		$event.preventDefault();
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Delete Issuer',
				dialogBody: this.badges.length
					? 'This issuer has active badges! Please delete them before trying to delete the issuer.'
					: `Are you sure you want to delete issuer ${this.issuer.name}?`,
				resolveButtonLabel: 'Delete Issuer',
				rejectButtonLabel: 'Cancel',
				disableConfirm: !!this.badges.length,
			})
			.then(
				() => {
					this.issuer.delete().then(
						() => {
							this.issuerManager.issuersList.invalidateList();
							this.messageService.reportMinorSuccess(`Deleted issuer '${this.issuer.name}'`);
							this.router.navigate(['/issuer/issuers']);
						},
						(error) => this.messageService.reportHandledError(`Failed to delete issuer`, error),
					);
				},
				() => {},
			);
	};

	ngOnInit() {
		super.ngOnInit();
		this.translate.get('NavItems.myInstitutions').subscribe((str) => {
			this.myInstitutions = str;
		});
	}

	routeToBadgeAward(badge, issuer) {
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
	}

	routeToBadgeDetail(badge, issuer) {
		this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug]);
	}
}
