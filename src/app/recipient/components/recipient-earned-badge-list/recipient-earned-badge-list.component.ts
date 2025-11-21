import { Component, ElementRef, OnInit, AfterContentInit, inject, viewChild, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { AddBadgeDialogComponent } from '../add-badge-dialog/add-badge-dialog.component';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { UserProfile } from '../../../common/model/user-profile.model';
import { CountUpModule } from 'ngx-countup';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe, LangChangeEvent } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';
import { ShareCollectionDialogComponent } from '../../../common/dialogs/oeb-dialogs/share-collection-dialog.component';
import { ApiRootSkill } from '../../../common/model/ai-skills.model';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { OebTabsComponent } from '../../../components/oeb-tabs.component';
import { BgCollectionCard } from '../../../common/bg-collectioncard';
import { RecipientSkillVisualisationComponent } from '../recipient-skill-visualisation/recipient-skill-visualisation.component';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH2 } from '@spartan-ng/helm/typography';
import { RecipientCompetencyOverview } from '../recipient-competency-overview/recipient-competency-overview.component';
import RecipientLearningPathsOverview from '../recipient-learningpaths-overview/recipient-learningpaths-overview.component';
import RecipientEarnedBadgesOverview from '../recipient-earned-badges-overview/recipient-earned-badges-overview.component';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';

export const VISUALISATION_BREAKPOINT_MAX_WIDTH: number = 768;

@Component({
	selector: 'recipient-earned-badge-list',
	templateUrl: './recipient-earned-badge-list.component.html',
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
		CountUpModule,
		BgCollectionCard,
		AddBadgeDialogComponent,
		TranslatePipe,
		RecipientSkillVisualisationComponent,
		RecipientCompetencyOverview,
		RecipientLearningPathsOverview,
		RecipientEarnedBadgesOverview,
	],
})
export class RecipientEarnedBadgeListComponent
	extends BaseAuthenticatedRoutableComponent
	implements OnInit, AfterContentInit
{
	readonly title = inject(Title);
	readonly dialogService = inject(CommonDialogsService);
	readonly messageService = inject(MessageService);
	readonly recipientBadgeManager = inject(RecipientBadgeManager);
	readonly learningPathApi = inject(LearningPathApiService);
	readonly configService = inject(AppConfigService);
	readonly profileManager = inject(UserProfileManager);
	readonly translate = inject(TranslateService);
	readonly recipientBadgeCollectionManager = inject(RecipientBadgeCollectionManager);
	readonly recipientBadgeApiService = inject(RecipientBadgeApiService);
	readonly _hlmDialogService = inject(HlmDialogService);
	readonly addBadgeDialog = viewChild<AddBadgeDialogComponent>('addBadgeDialog');
	readonly profileTemplate = viewChild<ElementRef>('profileTemplate');
	readonly badgesTemplate = viewChild<ElementRef>('badgesTemplate');
	readonly badgesCompetency = viewChild<ElementRef>('badgesCompetency');
	readonly learningPathTemplate = viewChild<ElementRef>('learningPathTemplate');
	readonly collectionTemplate = viewChild<ElementRef>('collectionTemplate');
	readonly collectionInfoHeaderTemplate = viewChild<ElementRef>('collectionInfoHeaderTemplate');
	readonly collectionInfoContentTemplate = viewChild<ElementRef>('collectionInfoContentTemplate');

	readonly inputTabs = input<string[]>(['profile', 'badges', 'competencies', 'microdegrees', 'collections']);

	allBadges: RecipientBadgeInstance[] = [];
	importedBadges: RecipientBadgeInstance[] = [];
	badgesLoaded: Promise<unknown>;
	profileLoaded: Promise<unknown>;
	skillsLoaded: Promise<unknown>;
	learningpathLoaded: Promise<unknown>;
	collectionsLoaded: Promise<unknown>;
	allSkills: ApiRootSkill[] = [];
	allLearningPaths: ApiLearningPath[] = [];
	collections: RecipientBadgeCollection[] = [];
	profile: UserProfile;
	tabs: { key: string; title: string; component: ElementRef }[] = [];
	dialogRef: BrnDialogRef = null;
	activeTab: string = 'profile';

	constructor() {
		super();

		this.title.setTitle(`Backpack - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		if (this.authService.isLoggedIn) {
			// force a refresh of the userProfileSet now that we are authenticated
			this.profileLoaded = this.profileManager.userProfileSet.updateList().then((p) => {
				this.profile = this.profileManager.userProfile;
				if (
					this.profileManager.userProfile.agreedTermsVersion !==
					this.profileManager.userProfile.latestTermsVersion
				) {
					this.dialogService.newTermsDialog.openDialog();
				}
			});
		}
	}

	ngOnInit() {
		super.ngOnInit();
		this.loadImportedBadges();

		this.badgesLoaded = this.recipientBadgeManager.recipientBadgeList.loadedPromise.catch((e) =>
			this.messageService.reportAndThrowError('Failed to load your badges', e),
		);
		this.recipientBadgeManager.recipientBadgeList.changed$.subscribe((badges) => {
			this.allBadges = badges.entities;
		});
		this.learningpathLoaded = this.learningPathApi
			.getLearningPathsForUser()
			.then((res) => {
				this.allLearningPaths = res;
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load your badges', e));

		let skillsLang = this.translate.currentLang;
		this.skillsLoaded = this.recipientBadgeApiService.getSkills(this.translate.currentLang).then((skills) => {
			this.allSkills = skills;
		});
		this.recipientBadgeManager.recipientBadgeList.changed$.subscribe((badges) => {
			const combinedBadges = [...this.importedBadges, ...badges.entities];
			this.allBadges = combinedBadges;
		});
		this.collectionsLoaded = Promise.all([
			this.recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise,
			this.recipientBadgeManager.recipientBadgeList.loadedPromise,
		]).then(([list]) => {
			this.collections = list.entities;
		});

		this.translate.onLangChange.subscribe((e: LangChangeEvent) => {
			if (e.lang != skillsLang) {
				this.skillsLoaded = this.recipientBadgeApiService.getSkills(e.lang).then((skills) => {
					this.allSkills = skills;
				});
				skillsLang = e.lang;
			}
		});

		this.route.queryParams.subscribe((params) => {
			if (params['tab']) {
				this.activeTab = params['tab'];
			}
		});
	}

	ngAfterContentInit() {
		this.tabs = this.inputTabs().map((t) => {
			switch (t) {
				case 'profile':
					return {
						key: 'profile',
						title: 'NavItems.profile',
						component: this.profileTemplate(),
					};
				case 'badges':
					return {
						key: 'badges',
						title: 'Badges',
						component: this.badgesTemplate(),
					};
				case 'competencies':
					return {
						key: 'competencies',
						title: 'RecBadge.competencies',
						component: this.badgesCompetency(),
					};
				case 'microdegrees':
					return {
						key: 'microdegrees',
						title: 'LearningPath.learningpathsPlural',
						component: this.learningPathTemplate(),
					};
				case 'collections':
					return {
						key: 'collections',
						title: 'General.collections',
						component: this.collectionTemplate(),
					};
			}
		});
	}

	loadImportedBadges() {
		this.recipientBadgeApiService
			.listImportedBadges()
			.then((res) => {
				this.importedBadges = res;
				// Force an update after loading imported badges
				const currentBadges = this.recipientBadgeManager.recipientBadgeList.entities || [];
				const combinedBadges = [...this.importedBadges, ...currentBadges];
				this.allBadges = combinedBadges;
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load imported badges', e));
	}

	openCollectionInfoDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.collectionInfoHeaderTemplate(),
				content: this.collectionInfoContentTemplate(),
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

	uploadBadge() {
		this.addBadgeDialog()
			.openDialog()
			.then(
				() => {
					if (this.activeTab != 'badges') {
						this.onTabChange('badges');
					}
					this.loadImportedBadges();
				},
				() => {},
			);
	}

	onTabChange(tab) {
		this.activeTab = tab;

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { tab: tab },
		});
	}

	routeToCollectionCreation() {
		this.router.navigate(['recipient/badge-collections/create']);
	}
}
