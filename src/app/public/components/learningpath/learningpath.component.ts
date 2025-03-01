import { AfterContentInit, Component, ElementRef, Injector, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import { PublicApiBadgeClass, PublicApiBadgeClassWithIssuer, PublicApiIssuer, PublicApiLearningPath } from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from '../../../common/app-config.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { UserProfileApiService } from '../../../common/services/user-profile-api.service';
import { TranslateService } from '@ngx-translate/core';
import { IssuerManager } from '../../../issuer/services/issuer-manager.service';
import type { Tab } from '../../../components/oeb-backpack-tabs.component';
import { SessionService } from '../../../common/services/session.service';

@Component({
	templateUrl: './learningpath.component.html',
})
export class PublicLearningPathComponent implements OnInit, AfterContentInit {

	learningPathSlug: string;
	isParticipating: boolean = false;
	learningPath: PublicApiLearningPath;
	learningPathIdParam: LoadedRouteParam<PublicApiLearningPath>;
	participationButtonText: string = 'Teilnehmen';
	issuerLoaded: Promise<unknown>;
	badgeLoaded: Promise<unknown>;
	loaded: LoadedRouteParam<void>;
	issuer: PublicApiIssuer;
	badge: PublicApiBadgeClassWithIssuer;
	progressPercentage: number | undefined = undefined;
	minutesCompleted: number;
	hoursCompleted: number;
	minutesCompletedRemainder: number;
	minutesTotal: number;
	tabs: Tab[] = undefined;
	activeTab = 'Alle';
	loggedIn = false;

	totalBadgeCount: number;
	openBadgeCount: number;
	finishedBadgeCount: number;

	openBadges: PublicApiBadgeClass[];
	completedBadgeIds: PublicApiBadgeClass[];

	participantButtonVariant: string;

	@ViewChild('allTemplate', { static: true }) allTemplate: ElementRef;
	@ViewChild('openTemplate', { static: true }) openTemplate: ElementRef;
	@ViewChild('finishedTemplate', { static: true }) finishedTemplate: ElementRef;


	crumbs = [
		{ title: 'Micro Degrees', routerLink: ['/catalog/learningpaths'] }
	];

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public configService: AppConfigService,
		public publicService: PublicApiService,
		private learningPathApiService: LearningPathApiService,
		protected userProfileApiService: UserProfileApiService,
		protected translate: TranslateService,
		protected sessionService: SessionService,
		public issuerManager: IssuerManager,
		private title: Title,
	) {
		this.title.setTitle(`LearningPath - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.loaded = new LoadedRouteParam(injector.get(ActivatedRoute), 'learningPathId', (paramValue) => {
			this.learningPathSlug = paramValue;
			return this.requestPath();
		});
	}

	ngOnInit(): void {
		this.loggedIn = this.sessionService.isLoggedIn
	}

	ngAfterContentInit() {

		this.tabs = [
			{
				title: 'Alle',
				count: this.totalBadgeCount,
				component: this.allTemplate,
			},
			{
				title: 'Offen',
				count: this.openBadgeCount,
				component: this.openTemplate,
			},
			{
				title: 'Abgeschlossen',
				count: this.finishedBadgeCount,
				component: this.finishedTemplate,
			},
		];
	}

	progressValue(): number {
		return Math.floor((this.minutesCompleted / this.minutesTotal) * 100);
	  }

	requestPath() {
		const service: PublicApiService = this.injector.get(PublicApiService);
		return service.getLearningPath(this.learningPathSlug).then((response) => {
			this.learningPath = response;
			this.totalBadgeCount = response.badges.length;
			this.completedBadgeIds = response.completed_badges ? response.completed_badges.map((badge) => badge.slug) : [];
			this.openBadges = response.badges.filter(
				(badge) => !this.completedBadgeIds.includes(badge.badge.slug),
			);

			this.tabs = [
				{
					title: 'Alle',
					count: this.totalBadgeCount,
					component: this.allTemplate,
				},
				{
					title: 'Offen',
					count: this.totalBadgeCount - (response.completed_badges ? response.completed_badges.length : 0),
					component: this.openTemplate,
				},
				{
					title: 'Abgeschlossen',
					count: (response.completed_badges ? response.completed_badges.length : 0),
					component: this.finishedTemplate,
				},
			];
			this.crumbs = [
				{ title: 'Micro Degrees', routerLink: ['/catalog/learningpaths'] },
				{ title: this.learningPath.name, routerLink: ['/public/learningpaths/' + this.learningPath.slug] },

			];
			if (response.progress === null) {
				this.isParticipating = false;
				this.participationButtonText = this.translate.instant('LearningPath.participate');
			} else {
				this.isParticipating = true;
				this.participationButtonText = this.translate.instant('LearningPath.notParticipateAnymore');
			}
			this.progressPercentage = response.progress;
			this.minutesTotal = response.badges.reduce(
				(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
				0,
			);

			this.minutesCompleted = response.completed_badges?.reduce(
				(acc, b) => acc + b.extensions['extensions:StudyLoadExtension'].StudyLoad,
				0,
			);
			this.hoursCompleted = Math.floor(this.minutesCompleted / 60);
			this.minutesCompletedRemainder = this.minutesCompleted % 60;
			this.issuerLoaded = this.publicService.getIssuer(response.issuer_id).then((issuer) => {
				this.issuer = issuer;
			});
			this.badgeLoaded = this.publicService
				.getBadgeClass(response.participationBadge_id)
				.then((badge) => {
					this.badge = badge;
					return badge;
				});
		})
	}

	onTabChange(tab) {
		this.activeTab = tab;
	}

	get learningPathReverseBadges() {
		return [...this.learningPath.badges].reverse()
	}

	get openBadgesReversed() {
		return [...this.openBadges].reverse()
	}
}
