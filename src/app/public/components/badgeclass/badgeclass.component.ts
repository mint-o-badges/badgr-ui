import { Component, inject, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiBadgeClassWithIssuer, PublicApiIssuer, PublicApiLearningPath } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from '../../../common/util/url-util';
import { routerLinkForUrl } from '../public/public.component';
import { AppConfigService } from '../../../common/app-config.service';
import { Title } from '@angular/platform-browser';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { SessionService } from '../../../common/services/session.service';
import { RecipientBadgeApiService } from '../../../recipient/services/recipient-badges-api.service';
import { TranslateService } from '@ngx-translate/core';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { Issuer } from '../../../issuer/models/issuer.model';
import { BadgeClassApiService } from '../../../issuer/services/badgeclass-api.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
	templateUrl: './badgeclass.component.html',
	standalone: false,
})
export class PublicBadgeClassComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	private _hlmDialogService = inject(HlmDialogService);

	@ViewChild('issuerSelection')
	issuerSelection: TemplateRef<void>;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	badgeIdParam: LoadedRouteParam<PublicApiBadgeClassWithIssuer>;
	routerLinkForUrl = routerLinkForUrl;

	config: PageConfig;

	learningPaths: PublicApiLearningPath[];

	userBadges: string[] = [];
	loggedIn = false;
	userBadgesLoaded: Promise<unknown>;
	userIssuers: Issuer[] = [];
	issuerBadge: BadgeClass = null;
	dialogRef: BrnDialogRef<unknown> = null;
	selectedIssuer: Issuer = null;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private title: Title,
		private sessionService: SessionService,
		private recipientBadgeApiService: RecipientBadgeApiService,
		private translate: TranslateService,
		protected issuerManager: IssuerManager,
		protected dialogService: CommonDialogsService,
		private router: Router,
		protected badgeClassManager: BadgeClassManager,
		protected userProfileManager: UserProfileManager,
	) {
		title.setTitle(`Badge Class - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.badgeIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'badgeId', async (paramValue) => {
			const service: PublicApiService = injector.get(PublicApiService);
			const badgeClass = service.getBadgeClass(paramValue);
			await service.getLearningPathsForBadgeClass(paramValue).then((lp) => {
				this.learningPaths = lp;
			});
			badgeClass.then((badge) => {
				this.config = {
					qrCodeButton: {
						show: false,
					},
					badgeTitle: badge.name,
					badgeDescription: badge.description,
					issuerSlug: badge.issuer['slug'],
					slug: badge.id,
					category: this.translate.instant(
						`Badge.categories.${badge['extensions:CategoryExtension']?.Category || 'participation'}`,
					),
					duration: badge['extensions:StudyLoadExtension'].StudyLoad,
					tags: badge.tags,
					issuerName: badge.issuer.name,
					issuerImagePlacholderUrl: this.issuerImagePlaceholderUrl,
					issuerImage: badge.issuer.image,
					badgeLoadingImageUrl: this.badgeLoadingImageUrl,
					badgeFailedImageUrl: this.badgeFailedImageUrl,
					badgeImage: badge.image,
					competencies: badge['extensions:CompetencyExtension'],
					license: badge['extensions:LicenseExtension'] ? true : false,
					crumbs: [{ title: 'Badges', routerLink: ['/catalog/badges'] }, { title: badge.name }],
					learningPaths: this.learningPaths,
					copy_permissions: badge.copy_permissions,
				};

				// wait for user profile, emails, issuer to check if user can copy
				this.userProfileManager.userProfilePromise.then((profile) => {
					profile.emails.loadedPromise.then(() => {
						this.issuerManager.allIssuers$.subscribe((issuers) => {
							this.userIssuers = issuers;
							const canCopy = issuers.some((issuer) => issuer.canCreateBadge);
							if (canCopy) {
								// fetch real badge information to check if badge may be copied
								const slug = badge.id.substring(badge.id.lastIndexOf('/') + 1);
								// badgeClassApiService.getBadgeBySlug(slug).then(apiBadge => {
								badgeClassManager.issuerBadgeById(slug).then((issuerBadge) => {
									if (issuerBadge) {
										this.issuerBadge = issuerBadge;
										if (
											issuerBadge.canCopy('others') ||
											(issuerBadge.canCopy('issuer') &&
												issuerBadge.extension['extensions:CategoryExtension'].Category !=
													'learningpath' &&
												issuers.some((issuer) => issuer.url == issuerBadge.issuer))
										) {
											this.config = {
												...this.config,
												headerButton: {
													title: this.translate.instant('Badge.copy'),
													action: this.copyBadge.bind(this),
												},
											};
										}
									}
								});
							}
						});
					});
				});
			});

			return badgeClass;
		});
	}

	ngOnInit(): void {
		this.loggedIn = this.sessionService.isLoggedIn;

		if (this.loggedIn) {
			this.userBadgesLoaded = this.recipientBadgeApiService.listRecipientBadges().then((badges) => {
				const badgeClassIds = badges.map((b) => b.json.badge.id);
				this.userBadges = badgeClassIds;
			});
		}
	}

	get badgeClass(): PublicApiBadgeClassWithIssuer {
		return this.badgeIdParam.value;
	}

	get issuer(): PublicApiIssuer {
		return this.badgeClass.issuer;
	}

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.badgeClass.id) + '.json';
	}

	calculateMatch(lp: LearningPath): string {
		const lpBadges = lp.badges;
		const badgeClassIds = lpBadges.map((b) => b.badge.json.id);
		const totalBadges = lpBadges.length;
		const userBadgeCount = badgeClassIds.filter((b) => this.userBadges.includes(b)).length;
		return `${userBadgeCount}/${totalBadges}`;
	}

	calculateLearningPathStatus(lp: LearningPath): { match: string } | { progress: number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress;
			return { progress: percentCompleted };
		} else {
			return { match: this.calculateMatch(lp) };
		}
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

	checkCompleted(lp: LearningPath): boolean {
		return lp.completed_at != null;
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	routeToBadgeCreation(issuer: Issuer) {
		this.closeDialog();
		this.router.navigate(['/issuer/issuers', issuer.slug, 'badges', 'create'], {
			state: { copybadgeid: this.issuerBadge.slug },
		});
	}

	copyBadge() {
		if (this.userIssuers.length == 1) {
			// copy
			this.router.navigate(['/issuer/issuers', this.userIssuers[0].slug, 'badges', 'create'], {
				state: { copybadgeid: this.badgeClass.id },
			});
		} else if (this.userIssuers.length > 1) {
			const dialogRef = this._hlmDialogService.open(DialogComponent, {
				context: {
					headerTemplate: this.headerTemplate,
					content: this.issuerSelection,
				},
			});

			this.dialogRef = dialogRef;
		}
	}
}
