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
import { ApiExternalToolLaunchpoint } from 'app/externaltools/models/externaltools-api.model';
import { ExternalToolsManager } from 'app/externaltools/services/externaltools-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { CollectionBadgeManager } from '../../services/collectionbadge-manager.service';
import { CollectionBadge } from '../../models/collectionbadge.model';

@Component({
	selector: 'issuer-detail',
	templateUrl: './issuer-detail.component.html',
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
	collectionBadges: CollectionBadge[];
	launchpoints: ApiExternalToolLaunchpoint[];

	profileEmails: UserProfileEmail[] = [];

	issuerLoaded: Promise<unknown>;
	badgesLoaded: Promise<unknown>;
	collectionBadgesLoaded: Promise<unknown>;

	profileEmailsLoaded: Promise<unknown>;
	crumbs: LinkEntry[];

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected badgeClassService: BadgeClassManager,
		protected collectionBadgeManager: CollectionBadgeManager,
		protected profileManager: UserProfileManager,
		private configService: AppConfigService,
		private externalToolsManager: ExternalToolsManager,
		private dialogService: CommonDialogsService,
	) {
		super(router, route, loginService);

		title.setTitle(`Issuer Detail - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.externalToolsManager.getToolLaunchpoints('issuer_external_launch').then((launchpoints) => {
			this.launchpoints = launchpoints.filter((lp) => Boolean(lp));
		});

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;
				this.title.setTitle(
					`Issuer - ${this.issuer.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
				this.crumbs = [
					{ title: 'Issuers', routerLink: ['/issuer/issuers'] },
					{ title: this.issuer.name, routerLink: ['/issuer/issuers/' + this.issuer.slug] },
				];

				this.collectionBadgesLoaded = this.collectionBadgeManager.collectionBadgeList.loadedPromise.catch((e) =>
					this.messageService.reportAndThrowError('Failed to load your collection badges', e),
				);

				this.collectionBadgeManager.collectionBadgeList.changed$.subscribe((collectionBadges) =>
					this.updateCollectionBadges(collectionBadges.entities),
				);

				this.badgesLoaded = new Promise<void>((resolve, reject) => {
					this.badgeClassService.badgesByIssuerUrl$.subscribe(
						(badgesByIssuer) => {
							const cmp = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
							this.badges = (badgesByIssuer[this.issuer.issuerUrl] || []).sort((a, b) =>
								cmp(b.createdAt, a.createdAt),
							);
							resolve();
						},
						(error) => {
							this.messageService.reportAndThrowError(
								`Failed to load badges for ${this.issuer ? this.issuer.name : this.issuerSlug}`,
								error,
							);
							resolve();
						},
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

	private updateCollectionBadges(allCollectionBadges: CollectionBadge[]) {
		this.collectionBadges = allCollectionBadges;
		// this.updateChartOptions();
	}

	ngOnInit() {
		super.ngOnInit();
	}
}
