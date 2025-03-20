import { Component, Injector } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

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

@Component({
    template: `<bg-badgedetail [config]="config" [awaitPromises]="[badgeClass]">
					<ng-template>
						<div class="oeb" *ngIf="learningPaths.length > 0">
							<oeb-separator class="tw-block tw-mb-8 tw-mt-8"></oeb-separator>
							<span class="tw-my-2 tw-text-oebblack tw-text-[22px] tw-leading-[26px] tw-font-semibold"> Dieser Badge ist Teil folgender Micro Degrees: </span>
							<div class="tw-mt-8 tw-grid tw-grid-cols-learningpaths tw-gap-6">
								<bg-learningpathcard *ngFor="let lp of learningPaths"
									[name]="lp.name"
									[badgeImage]="lp.participationBadge_image"
									[issuerTitle]="lp.issuer_name"
									[description]="lp.description"
									[slug]="lp.slug"
									[tags]="lp.tags"
									[studyLoad]="calculateStudyLoad(lp)"
									[progress]="lp.progress"
									[matchOrProgress]="calculateLearningPathStatus(lp)"
									[requested]="lp.requested"
									[completed]="checkCompleted(lp)"
								></bg-learningpathcard>
							</div>
						</div>
					</ng-template>
				</bg-badgedetail>`,
    standalone: false
})
export class PublicBadgeClassComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	badgeIdParam: LoadedRouteParam<PublicApiBadgeClassWithIssuer>;
	routerLinkForUrl = routerLinkForUrl;

	config: PageConfig

	learningPaths: PublicApiLearningPath[];

	userBadges: string[] = [];
	loggedIn = false;
	userBadgesLoaded: Promise<unknown>;


	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		private title: Title,
		private sessionService: SessionService,
		private recipientBadgeApiService: RecipientBadgeApiService,
		private translate: TranslateService
	) {
		title.setTitle(`Badge Class - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.badgeIdParam = new LoadedRouteParam(injector.get(ActivatedRoute), 'badgeId', async (paramValue) => {
			const service: PublicApiService = injector.get(PublicApiService);
			const badgeClass = service.getBadgeClass(paramValue);
			await service.getLearningPathsForBadgeClass(paramValue).then(lp => {
				this.learningPaths = lp;
			})
			badgeClass.then((badge) => {
				this.config = {
					qrCodeButton: {
						show: false
					},
					badgeTitle: badge.name,
					badgeDescription: badge.description,
					issuerSlug: badge.issuer['slug'],
					slug: badge.id,
					category: this.translate.instant(`Badge.categories.${badge['extensions:CategoryExtension']?.Category || 'participation'}`),
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
					learningPaths: this.learningPaths
				}
			})

			return badgeClass
		});
	}

	ngOnInit(): void {
		this.loggedIn = this.sessionService.isLoggedIn;

		if (this.loggedIn) {
			this.userBadgesLoaded = this.recipientBadgeApiService.listRecipientBadges().then((badges) => {
				const badgeClassIds = badges.map((b) => b.json.badge.id);
				this.userBadges = badgeClassIds;
			})
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

	calculateLearningPathStatus(lp: LearningPath): { 'match': string } | { 'progress': number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress
			return { 'progress': percentCompleted }
		}
		else {
			return { 'match': this.calculateMatch(lp) }
		}
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce((acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad, 0);
		return totalStudyLoad;
	}

	checkCompleted(lp: LearningPath): boolean {
		return lp.completed_at != null;
	}
}
