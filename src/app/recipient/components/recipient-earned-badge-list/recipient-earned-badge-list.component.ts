import { Component, ElementRef, OnInit, ViewChild, AfterContentInit, inject, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { groupIntoArray, groupIntoObject } from '../../../common/util/array-reducers';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { AddBadgeDialogComponent } from '../add-badge-dialog/add-badge-dialog.component';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { ApiRecipientBadgeIssuer } from '../../models/recipient-badge-api.model';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { UserProfile } from '../../../common/model/user-profile.model';
import { lucideHand, lucideHexagon, lucideMedal, lucideBookOpen, lucideClock, lucideHeart } from '@ng-icons/lucide';
import { CountUpDirective, CountUpModule } from 'ngx-countup';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe, LangChangeEvent } from '@ngx-translate/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { RecipientBadgeCollectionApiService } from '../../services/recipient-badge-collection-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';
import { ShareCollectionDialogComponent } from '../../../common/dialogs/oeb-dialogs/share-collection-dialog.component';
import { ApiRootSkill } from '../../../common/model/ai-skills.model';
import { BreakpointService } from '../../../common/services/breakpoint.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebTabsComponent } from '../../../components/oeb-tabs.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { BgBadgecard } from '../../../common/components/bg-badgecard';
import { BgLearningPathCard } from '../../../common/components/bg-learningpathcard';
import { BgCollectionCard } from '../../../common/bg-collectioncard';
import { RecipientSkillVisualisationComponent } from '../recipient-skill-visualisation/recipient-skill-visualisation.component';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmH2, HlmP, HlmH3 } from '@spartan-ng/helm/typography';
import { MatchingAlgorithm } from '~/common/util/matching-algorithm';
import { OebGlobalSortSelectComponent } from '~/components/oeb-global-sort-select.component';
import { appearAnimation } from '~/common/animations/animations';
import { RecipientCompetencyOverview } from '../recipient-competency-overview/recipient-competency-overview.component';
import RecipientLearningPathsOverview from '../recipient-learningpaths-overview/recipient-learningpaths-overview.component';

type BadgeDispay = 'grid' | 'list';

export const VISUALISATION_BREAKPOINT_MAX_WIDTH: number = 768;

@Component({
	selector: 'recipient-earned-badge-list',
	templateUrl: './recipient-earned-badge-list.component.html',
	animations: [appearAnimation],
	imports: [
		FormMessageComponent,
		BgAwaitPromises,
		HlmH2,
		OebButtonComponent,
		FormsModule,
		ReactiveFormsModule,
		OebTabsComponent,
		NgIcon,
		HlmIcon,
		HlmP,
		CountUpModule,
		HlmInput,
		OebCheckboxComponent,
		BgBadgecard,
		HlmH3,
		BgLearningPathCard,
		BgCollectionCard,
		AddBadgeDialogComponent,
		TranslatePipe,
		RecipientSkillVisualisationComponent,
		OebGlobalSortSelectComponent,
		RecipientCompetencyOverview,
		RecipientLearningPathsOverview,
	],
})
export class RecipientEarnedBadgeListComponent
	extends BaseAuthenticatedRoutableComponent
	implements OnInit, AfterContentInit
{
	private title = inject(Title);
	private dialogService = inject(CommonDialogsService);
	private messageService = inject(MessageService);
	private recipientBadgeManager = inject(RecipientBadgeManager);
	private learningPathApi = inject(LearningPathApiService);
	configService = inject(AppConfigService);
	private profileManager = inject(UserProfileManager);
	private translate = inject(TranslateService);
	recipientBadgeCollectionApiService = inject(RecipientBadgeCollectionApiService);
	private recipientBadgeCollectionManager = inject(RecipientBadgeCollectionManager);
	private recipientBadgeApiService = inject(RecipientBadgeApiService);
	private breakpointService = inject(BreakpointService);

	readonly noBadgesImageUrl = '../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-backpack.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	@ViewChild('addBadgeDialog')
	addBadgeDialog: AddBadgeDialogComponent;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	allBadges: RecipientBadgeInstance[] = [];
	importedBadges: RecipientBadgeInstance[] = [];
	badgesLoaded: Promise<unknown>;
	profileLoaded: Promise<unknown>;
	skillsLoaded: Promise<unknown>;
	learningpathLoaded: Promise<unknown>;
	collectionsLoaded: Promise<unknown>;
	importedBadgesLoaded: Promise<unknown>;
	allIssuers: ApiRecipientBadgeIssuer[] = [];
	allSkills: ApiRootSkill[] = [];
	allLearningPaths: any[] = [];
	collections: RecipientBadgeCollection[] = [];

	badgeResults: BadgeResult[] = [];
	learningPathResults: any[] = [];
	learningPathsInProgress: LearningPath[] = [];
	learningPathsCompleted: LearningPath[] = [];
	learningPathsReadyToRequest: LearningPath[] = [];
	issuerResults: MatchingIssuerBadges[] = [];
	issuerLearningPathResults: MatchingLearningPathIssuer[] = [];
	badgeClassesByIssuerId: { [issuerUrl: string]: RecipientBadgeInstance[] };

	mozillaTransitionOver = true;
	mozillaFeatureEnabled = this.configService.featuresConfig['enableComingFromMozilla'];
	maxDisplayedResults = 100;

	crumbs: LinkEntry[] = [{ title: 'Mein Rucksack', routerLink: ['/recipient/badges'] }];
	profile: UserProfile;
	running = false;
	tabs: { key: string; title: string; component: ElementRef }[] = [];
	@ViewChild('overViewTemplate', { static: true }) overViewTemplate: ElementRef;
	@ViewChild('profileTemplate', { static: true }) profileTemplate: ElementRef;
	@ViewChild('badgesTemplate', { static: true }) badgesTemplate: ElementRef;
	@ViewChild('badgesCompetency', { static: true }) badgesCompetency: ElementRef;
	@ViewChild('learningPathTemplate', { static: true }) learningPathTemplate: ElementRef;
	@ViewChild('collectionTemplate', { static: true }) collectionTemplate: ElementRef;
	@ViewChild('collectionInfoHeaderTemplate', { static: true }) collectionInfoHeaderTemplate: ElementRef;
	@ViewChild('collectionInfoContentTemplate', { static: true }) collectionInfoContentTemplate: ElementRef;

	dialogRef: BrnDialogRef = null;
	translatedTitles: string[] = [];
	@ViewChild('badgesCounter') badgesCounter: CountUpDirective;

	activeTab: string = 'profile';
	private _badgesDisplay: BadgeDispay = 'grid';
	sortControl = new FormControl('date_desc');

	mobile = window.innerWidth <= VISUALISATION_BREAKPOINT_MAX_WIDTH;

	get badgesDisplay() {
		return this._badgesDisplay;
	}
	set badgesDisplay(val: BadgeDispay) {
		this._badgesDisplay = val;
		// this.updateResults();
		this.saveDisplayState();
	}

	private _groupByIssuer = false;
	get groupByIssuer() {
		return this._groupByIssuer;
	}
	set groupByIssuer(val: boolean) {
		this._groupByIssuer = val;
		this.saveDisplayState();
		this.updateResults();
	}

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.saveDisplayState();
		this.updateResults();
	}

	constructor() {
		super();
		const sessionService = inject(SessionService);
		const title = this.title;
		const dialogService = this.dialogService;
		const profileManager = this.profileManager;
		const translate = this.translate;

		title.setTitle(`Backpack - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.badgesLoaded = this.recipientBadgeManager.recipientBadgeList.loadedPromise.catch((e) =>
			this.messageService.reportAndThrowError('Failed to load your badges', e),
		);

		let skillsLang = translate.currentLang;
		this.skillsLoaded = this.recipientBadgeApiService.getSkills(translate.currentLang).then((skills) => {
			this.allSkills = skills;
		});
		translate.onLangChange.subscribe((e: LangChangeEvent) => {
			if (e.lang != skillsLang) {
				this.skillsLoaded = this.recipientBadgeApiService.getSkills(e.lang).then((skills) => {
					this.allSkills = skills;
				});
				skillsLang = e.lang;
			}
		});

		this.learningpathLoaded = this.learningPathApi
			.getLearningPathsForUser()
			.then((res) => {
				this.allLearningPaths = res;
				this.updateResults();
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load your badges', e));

		this.collectionsLoaded = Promise.all([
			this.recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise,
			this.recipientBadgeManager.recipientBadgeList.loadedPromise,
		]).then(([list]) => {
			this.collections = list.entities;
		});
		this.recipientBadgeManager.recipientBadgeList.changed$.subscribe((badges) =>
			this.updateBadges(badges.entities),
		);

		if (sessionService.isLoggedIn) {
			// force a refresh of the userProfileSet now that we are authenticated
			this.profileLoaded = profileManager.userProfileSet.updateList().then((p) => {
				this.profile = profileManager.userProfile;
				if (profileManager.userProfile.agreedTermsVersion !== profileManager.userProfile.latestTermsVersion) {
					dialogService.newTermsDialog.openDialog();
				}
			});
		}

		this.mozillaTransitionOver = !!localStorage.getItem('mozillaTransitionOver') || false;

		this.restoreDisplayState();
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openCollectionInfoDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.collectionInfoHeaderTemplate,
				content: this.collectionInfoContentTemplate,
				variant: 'default',
				footer: false,
			},
		});

		this.dialogRef = dialogRef;
	}

	openShareDialog(collection: RecipientBadgeCollection) {
		const dialogRef = this._hlmDialogService.open(ShareCollectionDialogComponent, {
			context: {
				collection: collection,
				caption: this.translate.instant('BadgeCollection.shareCollection'),
			},
		});

		this.dialogRef = dialogRef;
	}

	hideMozz = ($event: Event) => {
		$event.preventDefault();
		this.mozillaTransitionOver = true;
		localStorage.setItem('mozillaTransitionOver', 'true');
	};

	restoreDisplayState() {
		try {
			const state: object = JSON.parse(window.localStorage['recipient-earned-badge-list-viewstate']);

			this.groupByIssuer = state['groupByIssuer'];
			this.searchQuery = state['searchQuery'];
			this.badgesDisplay = state['badgesDisplay'];
		} catch (e) {
			// Bad serialization
		}
	}

	saveDisplayState() {
		try {
			window.localStorage['recipient-earned-badge-list-viewstate'] = JSON.stringify({
				groupByIssuer: this.groupByIssuer,
				searchQuery: this.searchQuery,
				badgesDisplay: this.badgesDisplay,
			});
		} catch (e) {
			// We can't always save to local storage
		}
	}

	ngOnInit() {
		this.breakpointService.observeCustomBreakpoint(VISUALISATION_BREAKPOINT_MAX_WIDTH).subscribe((isMobile) => {
			this.mobile = isMobile;
		});

		this.loadImportedBadges();

		this.recipientBadgeManager.recipientBadgeList.changed$.subscribe((badges) => {
			const combinedBadges = [...this.importedBadges, ...badges.entities];
			this.updateBadges(combinedBadges);
		});
		super.ngOnInit();
		this.route.queryParams.subscribe((params) => {
			if (params['tab']) {
				this.activeTab = params['tab'];
			}
		});
	}

	private loadImportedBadges() {
		this.recipientBadgeApiService
			.listImportedBadges()
			.then((res) => {
				this.importedBadges = res;
				// Force an update after loading imported badges
				const currentBadges = this.recipientBadgeManager.recipientBadgeList.entities || [];
				const combinedBadges = [...this.importedBadges, ...currentBadges];
				this.updateBadges(combinedBadges);
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load imported badges', e));
	}

	ngAfterContentInit() {
		this.tabs = [
			{
				key: 'profile',
				title: 'NavItems.profile',
				component: this.profileTemplate,
			},
			{
				key: 'badges',
				title: 'Badges',
				component: this.badgesTemplate,
			},
			{
				key: 'competencies',
				title: 'RecBadge.competencies',
				component: this.badgesCompetency,
			},
			{
				key: 'microdegrees',
				title: 'LearningPath.learningpathsPlural',
				component: this.learningPathTemplate,
			},
			{
				key: 'collections',
				title: 'General.collections',
				component: this.collectionTemplate,
			},
		];
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	addBadge() {
		this.addBadgeDialog.openDialog().then(
			() => {},
			() => {},
		);
	}

	uploadBadge() {
		this.addBadgeDialog.openDialog().then(
			() => {
				if (this.activeTab != 'badges') {
					this.onTabChange('badges');
				}
				this.loadImportedBadges();
			},
			() => {},
		);
	}

	deleteBadge(badge: RecipientBadgeInstance) {
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: this.translate.instant('RecBadgeDetail.confirmRemove'),
				dialogBody: this.translate.instant('RecBadgeDetail.sureToRemove', {
					badgeName: badge.badgeClass.name,
				}),
				rejectButtonLabel: this.translate.instant('General.cancel'),
				resolveButtonLabel: this.translate.instant('RecBadgeDetail.removeBadge'),
			})
			.then(
				() => this.recipientBadgeManager.deleteRecipientBadge(badge),
				() => {},
			);
	}

	private updateBadges(allBadges: RecipientBadgeInstance[]) {
		this.badgeClassesByIssuerId = allBadges.reduce(
			groupIntoObject<RecipientBadgeInstance>((b) => b.issuerId),
			{},
		);

		this.allIssuers = allBadges
			.reduce(
				groupIntoArray<RecipientBadgeInstance, string>((b) => b.issuerId),
				[],
			)
			.map((g) => g.values[0].badgeClass.issuer);

		this.allBadges = allBadges;
		this.updateResults();
	}

	issuerIdToSlug(issuerId) {
		if (issuerId.startsWith('http')) {
			let splitted = issuerId.split(/[/.\s]/);
			return splitted[splitted.length - 1];
		} else {
			return issuerId;
		}
	}

	private updateResults() {
		// Clear Results
		this.badgeResults.length = 0;
		this.learningPathResults.length = 0;
		this.issuerResults.length = 0;
		this.issuerLearningPathResults.length = 0;
		this.learningPathsCompleted.length = 0;
		this.learningPathsReadyToRequest.length = 0;
		this.learningPathsInProgress.length = 0;

		const issuerResultsByIssuer: { [issuerUrl: string]: MatchingIssuerBadges } = {};

		const addBadgeToResults = (badge: RecipientBadgeInstance) => {
			// Restrict Length
			if (this.badgeResults.length > this.maxDisplayedResults) {
				return false;
			}

			let issuerResults = issuerResultsByIssuer[badge.issuerId];

			if (!issuerResults) {
				issuerResults = issuerResultsByIssuer[badge.issuerId] = new MatchingIssuerBadges(
					badge.issuerId,
					badge.badgeClass.issuer,
				);

				// append result to the issuerResults array bound to the view template.
				this.issuerResults.push(issuerResults);
			}

			issuerResults.addBadge(badge);

			if (!this.badgeResults.find((r) => r.badge === badge)) {
				// appending the results to the badgeResults array bound to the view template.
				this.badgeResults.push(new BadgeResult(badge, issuerResults.issuer));
			}
			return true;
		};

		const addToLearningPathResults = (learningPath: any) => {
			// Restrict Length
			if (this.learningPathResults.length > this.maxDisplayedResults) {
				return false;
			}

			if (!this.learningPathResults.find((r) => r.learningPath === learningPath)) {
				// appending the results to the badgeResults array bound to the view template.
				if (learningPath.completed_at) {
					if (!this.learningPathsCompleted.find((r) => r === learningPath)) {
						this.learningPathsCompleted.push(learningPath);
					}
				} else if (learningPath.progress / this.calculateStudyLoad(learningPath) == 1) {
					if (!this.learningPathsReadyToRequest.find((r) => r === learningPath)) {
						this.learningPathsReadyToRequest.push(learningPath);
					}
				} else {
					if (!this.learningPathsInProgress.find((r) => r === learningPath)) {
						this.learningPathsInProgress.push(learningPath);
					}
				}
				this.learningPathResults.push(learningPath);
			}
			return true;
		};

		const addIssuerToResults = (issuer: ApiRecipientBadgeIssuer) => {
			(this.badgeClassesByIssuerId[issuer.id] || []).forEach(addBadgeToResults);
		};

		this.allIssuers.filter(MatchingAlgorithm.issuerMatcher(this.searchQuery)).forEach(addIssuerToResults);

		this.allBadges.filter(MatchingAlgorithm.badgeMatcher(this._searchQuery)).forEach(addBadgeToResults);
		this.allLearningPaths
			.filter(MatchingAlgorithm.learningPathMatcher(this._searchQuery))
			.forEach(addToLearningPathResults);
		this.badgeResults.sort((a, b) => b.badge.issueDate.getTime() - a.badge.issueDate.getTime());
		this.issuerResults.forEach((r) => r.badges.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime()));
		// this.learningPathResults.forEach((r) => r.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime()));
	}

	trackById(index: number, badge: RecipientBadgeInstance) {
		return badge.slug;
	}

	onSortChanged(sortOption: string): void {
		this.badgeResults = this.sortBadges([...this.badgeResults], sortOption);
	}

	private sortBadges(badges: BadgeResult[], sortOption: string): BadgeResult[] {
		const [sortBy, order] = sortOption.split('_') as ['name' | 'date', 'asc' | 'desc'];
		const multiplier = order === 'asc' ? 1 : -1;

		return badges.sort((a, b) => {
			const nameA = a.badge.badgeClass.name;
			const nameB = b.badge.badgeClass.name;
			const dateA = new Date(a.badge.issueDate).getTime();
			const dateB = new Date(b.badge.issueDate).getTime();

			if (sortBy === 'name') {
				return multiplier * nameA.localeCompare(nameB);
			}
			if (sortBy === 'date') {
				return multiplier * (dateA - dateB);
			}
			return 0;
		});
	}

	onTabChange(tab) {
		this.activeTab = tab;

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { tab: tab },
		});
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

	checkCompleted(lp: LearningPath): boolean {
		if (lp.required_badges_count != lp.badges.length) {
			const badgeClassIds = lp.badges.map((b) => b.badge.slug);
			const userBadgeCount = this.allBadges.filter((b) =>
				badgeClassIds.some((i) => b.badgeClass.slug == i),
			).length;
			return userBadgeCount >= lp.required_badges_count;
		}
		return lp.completed_at != null;
	}

	routeToCollectionCreation() {
		this.router.navigate(['recipient/badge-collections/create']);
	}
}

export class BadgeResult {
	constructor(
		public badge: RecipientBadgeInstance,
		public issuer: ApiRecipientBadgeIssuer,
	) {}
}

class MatchingIssuerBadges {
	constructor(
		public issuerId: string,
		public issuer: ApiRecipientBadgeIssuer,
		public badges: RecipientBadgeInstance[] = [],
	) {}

	addBadge(badge: RecipientBadgeInstance) {
		if (badge.issuerId === this.issuerId) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}

class MatchingLearningPathIssuer {
	constructor(
		public issuerName: string,
		public learningpaths: LearningPath[] = [],
	) {}

	async addLp(learningpath) {
		if (learningpath.issuer_name === this.issuerName) {
			if (this.learningpaths.indexOf(learningpath) < 0) {
				this.learningpaths.push(learningpath);
			}
		}
	}
}
