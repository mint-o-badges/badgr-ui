import {
	Component,
	ContentChild,
	ElementRef,
	OnInit,
	ViewChild,
	AfterContentInit,
	inject,
	TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { groupIntoArray, groupIntoObject } from '../../../common/util/array-reducers';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';

import { AddBadgeDialogComponent } from '../add-badge-dialog/add-badge-dialog.component';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { ApiRecipientBadgeIssuer } from '../../models/recipient-badge-api.model';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { badgeShareDialogOptionsFor } from '../recipient-earned-badge-detail/recipient-earned-badge-detail.component';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { ImportLauncherDirective } from '../../../mozz-transition/directives/import-launcher/import-launcher.directive';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { UserProfile } from '../../../common/model/user-profile.model';
import { lucideHand, lucideHexagon, lucideMedal, lucideBookOpen, lucideClock, lucideHeart } from '@ng-icons/lucide';
import { CountUpDirective } from 'ngx-countup';
import { Competency } from '../../../common/model/competency.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { RecipientBadgeCollectionApiService } from '../../services/recipient-badge-collection-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { forkJoin } from 'rxjs';
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';

type BadgeDispay = 'grid' | 'list';
type EscoCompetencies = {
	[key: string]: Competency;
};

@Component({
	selector: 'recipient-earned-badge-list',
	templateUrl: './recipient-earned-badge-list.component.html',
	providers: [
		provideIcons({ lucideHexagon }),
		provideIcons({ lucideMedal }),
		provideIcons({ lucideClock }),
		provideIcons({ lucideHand }),
		provideIcons({ lucideBookOpen }),
		provideIcons({ lucideHeart }),
	],
	standalone: false,
})
export class RecipientEarnedBadgeListComponent
	extends BaseAuthenticatedRoutableComponent
	implements OnInit, AfterContentInit
{
	readonly noBadgesImageUrl = '../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-backpack.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	@ViewChild('addBadgeDialog')
	addBadgeDialog: AddBadgeDialogComponent;

	@ViewChild(ImportLauncherDirective) importLauncherDirective: ImportLauncherDirective;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	allBadges: RecipientBadgeInstance[] = [];
	importedBadges: RecipientBadgeInstance[] = [];
	badgesLoaded: Promise<unknown>;
	profileLoaded: Promise<unknown>;
	learningpathLoaded: Promise<unknown>;
	collectionsLoaded: Promise<unknown>;
	importedBadgesLoaded: Promise<unknown>;
	allIssuers: ApiRecipientBadgeIssuer[] = [];
	allLearningPaths: any[] = [];
	collections: any[] = [];

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
	tabs: any[] = [];
	@ViewChild('overViewTemplate', { static: true }) overViewTemplate: ElementRef;
	@ViewChild('badgesTemplate', { static: true }) badgesTemplate: ElementRef;
	@ViewChild('badgesCompetency', { static: true }) badgesCompetency: ElementRef;
	@ViewChild('learningPathTemplate', { static: true }) learningPathTemplate: ElementRef;
	@ViewChild('collectionTemplate', { static: true }) collectionTemplate: ElementRef;
	@ViewChild('collectionInfoHeaderTemplate', { static: true }) collectionInfoHeaderTemplate: ElementRef;
	@ViewChild('collectionInfoContentTemplate', { static: true }) collectionInfoContentTemplate: ElementRef;
	@ViewChild('shareDialogContentTemplate', { static: true }) shareDialogContentTemplate: ElementRef;
	@ViewChild('shareDialogHeaderTemplate', { static: true }) shareDialogHeaderTemplate: ElementRef;

	dialogRef: BrnDialogRef<any> = null;
	translatedTitles: string[] = [];

	groupedUserCompetencies = {};
	newGroupedUserCompetencies = {};

	totalStudyTime = 0;
	public objectKeys = Object.keys;
	public objectValues = Object.values;

	@ViewChild('countup') countup: CountUpDirective;
	@ViewChild('countup2') countup2: CountUpDirective;
	@ViewChild('badgesCounter') badgesCounter: CountUpDirective;

	activeTab: string = 'badges';
	private _badgesDisplay: BadgeDispay = 'grid';
	sortControl = new FormControl('date_desc');
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

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,

		private title: Title,
		private dialogService: CommonDialogsService,
		private messageService: MessageService,
		private recipientBadgeManager: RecipientBadgeManager,
		private learningPathApi: LearningPathApiService,
		public configService: AppConfigService,
		private profileManager: UserProfileManager,
		private translate: TranslateService,
		public recipientBadgeCollectionApiService: RecipientBadgeCollectionApiService,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager,
		private recipientBadgeApiService: RecipientBadgeApiService,
	) {
		super(router, route, sessionService);

		title.setTitle(`Backpack - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.badgesLoaded = this.recipientBadgeManager.recipientBadgeList.loadedPromise.catch((e) =>
			this.messageService.reportAndThrowError('Failed to load your badges', e),
		);

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

	openShareDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.shareDialogHeaderTemplate,
				content: this.shareDialogContentTemplate,
				footer: false,
			},
		});

		this.dialogRef = dialogRef;
	}

	// NOTE: Mozz import functionality
	launchImport = ($event: Event) => {
		$event.preventDefault();
		this.importLauncherDirective.insert();
	};
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

	async copyToClipboard(text: string): Promise<boolean>{	
		await navigator.clipboard.writeText(text);
		return true;
	  } catch (err) {
		console.error('Failed to copy text: ', err);
		return false;
	  }

	ngOnInit() {
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

		if (this.route.snapshot.routeConfig.path === 'badges/import') this.launchImport(new Event('click'));
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
				key: 'badges',
				title: 'Badges',
				component: this.badgesTemplate,
			},
			{
				key: 'competencies',
				title: this.translate.instant('RecBadge.competencies'),
				component: this.badgesCompetency,
			},
			{
				key: 'microdegrees',
				title: 'Micro Degrees',
				component: this.learningPathTemplate,
			},
			{
				key: 'collections',
				title: this.translate.instant('BadgeCollection.myCollections'),
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
				this.loadImportedBadges();
			},
			() => {},
		);
	}

	shareBadge(badge: RecipientBadgeInstance) {
		badge.markAccepted();

		this.dialogService.shareSocialDialog.openDialog(badgeShareDialogOptionsFor(badge));
	}

	deleteBadge(badge: RecipientBadgeInstance) {
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Confirm Remove',
				dialogBody: `Are you sure you want to remove ${badge.badgeClass.name} from your badges?`,
				rejectButtonLabel: 'Cancel',
				resolveButtonLabel: 'Remove Badge',
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
		this.groupCompetencies(allBadges);
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

	trackById(index: number, item: any): any {
		return item.id;
	}

	private groupCompetencies(badges) {
		let groupedCompetencies: EscoCompetencies = {};
		let newGroupedCompetencies: EscoCompetencies = {};
		this.groupedUserCompetencies = {};
		this.newGroupedUserCompetencies = {};

		badges.forEach((badge) => {
			let competencies = badge.getExtension('extensions:CompetencyExtension', [{}]);
			competencies.forEach((competency) => {
				const key = competency['framework_identifier'] || competency.name + String(competency.studyLoad);
				if (groupedCompetencies[key]) {
					groupedCompetencies[key].studyLoad += competency.studyLoad;
					if (groupedCompetencies[key].lastReceived < badge.issueDate) {
						groupedCompetencies[key].lastReceived = badge.issueDate;
					}
				} else {
					groupedCompetencies[key] = { ...competency };
					groupedCompetencies[key].lastReceived = badge.issueDate;
				}
				this.totalStudyTime += competency.studyLoad;
			});
		});

		badges
			.filter((badge) => badge.mostRelevantStatus)
			.forEach((badge) => {
				let competencies = badge.getExtension('extensions:CompetencyExtension', [{}]);
				competencies.forEach((competency) => {
					const key = competency['framework_identifier'] || competency.name + String(competency.studyLoad);
					if (newGroupedCompetencies[key]) {
						newGroupedCompetencies[key].studyLoad += competency.studyLoad;
						if (newGroupedCompetencies[key].lastReceived < badge.issueDate) {
							newGroupedCompetencies[key].lastReceived = badge.issueDate;
						}
					} else {
						newGroupedCompetencies[key] = { ...competency };
						newGroupedCompetencies[key].lastReceived = badge.issueDate;
					}
				});
			});

		this.groupedUserCompetencies = Object.values(groupedCompetencies).sort((a, b) => {
			return a.lastReceived.getTime() - b.lastReceived.getTime();
		});
		this.newGroupedUserCompetencies = Object.values(newGroupedCompetencies).sort((a, b) => {
			return a.lastReceived.getTime() - b.lastReceived.getTime();
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

	routeToCollectionCreation() {
		console.log('routed');
		this.router.navigate(['recipient/badge-collections/create']);
	}
}

class BadgeResult {
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

class MatchingAlgorithm {
	static issuerMatcher(inputPattern: string): (issuer: ApiRecipientBadgeIssuer) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (issuer) => StringMatchingUtil.stringMatches(issuer.name, patternStr, patternExp);
	}

	static badgeMatcher(inputPattern: string): (badge: RecipientBadgeInstance) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (badge) => StringMatchingUtil.stringMatches(badge.badgeClass.name, patternStr, patternExp);
	}
	static learningPathMatcher(inputPattern: string): (learningPath: any) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (learningPath) => StringMatchingUtil.stringMatches(learningPath.name, patternStr, patternExp);
	}
}
