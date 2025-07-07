import {
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	isDevMode,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { Validators, FormsModule, ReactiveFormsModule, ValidationErrors, FormControl } from '@angular/forms';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerApiService } from '../../services/issuer-api.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { EffectAllowed } from 'ngx-drag-drop';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LearningPath } from '../../models/learningpath.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { LearningPathManager } from '../../services/learningpath-manager.service';
import { StepperComponent } from '../../../components/stepper/stepper.component';
import { AppConfigService } from '../../../common/app-config.service';
import { BadgeClassApiService } from '../../services/badgeclass-api.service';
import { UrlValidator } from '../../../common/validators/url.validator';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { StepComponent } from '../../../components/stepper/step.component';
import { CdkStep } from '@angular/cdk/stepper';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { sortUnique } from '~/catalog/components/badge-catalog/badge-catalog.component';
import { StringMatchingUtil } from '~/common/util/string-matching-util';
import { BadgeClassCategory } from '~/issuer/models/badgeclass-api.model';
import { base64ByteSize } from '~/common/util/file-util';
import { BadgeStudioComponent } from '../badge-studio/badge-studio.component';
import { BgFormFieldImageComponent } from '~/common/components/formfield-image';
import { OebInputComponent } from '../../../components/input.component';
import { BgBadgecard } from '../../../common/components/bg-badgecard';
import { BgAwaitPromises } from '~/common/directives/bg-await-promises';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { FormFieldSelectOption } from '~/common/components/formfield-select';
import { HlmH2Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h2.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { HlmInputDirective } from '../../../components/spartan/ui-input-helm/src/lib/hlm-input.directive';
import { OebSeparatorComponent } from '../../../components/oeb-separator.component';
import { OebSelectComponent } from '~/components/select.component';
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective, DropEffect } from 'ngx-drag-drop';
import { HlmDialogService } from '~/components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DangerDialogComponent } from '~/common/dialogs/oeb-dialogs/danger-dialog.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';

interface DraggableItem {
	content: string;
	effectAllowed: EffectAllowed;
	disable: boolean;
	handle: boolean;
}

type BadgeResult = BadgeClass & { selected?: boolean };

@Component({
	selector: 'learningpath-edit-form',
	templateUrl: './learningpath-edit-form.component.html',
	styleUrls: ['./learningpath-edit-form.component.scss'],
	imports: [
		FormMessageComponent,
		FormsModule,
		ReactiveFormsModule,
		StepperComponent,
		NgIf,
		NgClass,
		NgFor,
		StepComponent,
		CdkStep,
		BgAwaitPromises,
		AutocompleteLibModule,
		OebButtonComponent,
		TranslatePipe,
		OebInputComponent,
		BgFormFieldImageComponent,
		BadgeStudioComponent,
		BgBadgecard,
		HlmH2Directive,
		HlmPDirective,
		HlmInputDirective,
		OebSeparatorComponent,
		OebSelectComponent,
		DndDraggableDirective,
		DndDropzoneDirective,
		OebCheckboxComponent,
	],
})
export class LearningPathEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	@ViewChild(StepperComponent) stepper: StepperComponent;

	@ViewChild('badgeStudio')
	badgeStudio: BadgeStudioComponent;

	@ViewChild('imageField')
	imageField: BgFormFieldImageComponent;

	@ViewChild('customImageField')
	customImageField: BgFormFieldImageComponent;

	@ViewChild('newTagInput')
	newTagInput: ElementRef<HTMLInputElement>;

	@ViewChild('activationSection') activationSection!: ElementRef;

	nextStep(): void {
		this.learningPathForm.markTreeDirtyAndValidate();
		this.stepper.next();
	}

	previousStep(): void {
		this.stepper.previous();
	}

	lastStep(): boolean {
		return this.stepper?.selectedIndex == this.stepper?.steps.length - 1;
	}

	firstStep(): boolean {
		if (this.initialisedLearningpath) {
			return this.stepper?.selectedIndex == 0;
		}
		return this.stepper?.selectedIndex == 1;
	}

	@Output()
	save = new EventEmitter<Promise<LearningPath>>();

	@Output()
	cancel = new EventEmitter<void>();

	@Input()
	submittingText: string;

	@Input() learningPath: LearningPath;
	@Input() lpBadge: BadgeClass;

	existingLpBadge: BadgeClass | null = null;

	currentImage;

	readonly badgeClassPlaceholderImageUrl = '../../../../breakdown/static/images/placeholderavatar.svg';

	allowedFileFormats = ['image/png', 'image/svg+xml'];
	allowedFileFormatsCustom = ['image/png'];

	initialisedLearningpath: LearningPath | null = null;

	breadcrumbLinkEntries: LinkEntry[] = [];
	selectedBadges: BadgeClass[] = [];
	studyLoad: number = 0;
	savePromise: Promise<LearningPath> | Promise<void> | null = null;

	isDevMode: boolean = false && isDevMode(); // DEBUG: enable to skip steps

	baseUrl: string;

	focusActivation = false;
	hasScrolled = false;

	issuer: Issuer;
	issuerLoaded: Promise<unknown>;

	isCustomImageLarge = false;
	maxCustomImageSize = 1024 * 250;

	issuers: string[] = [];
	tags: string[] = [];

	useOurEditor: string;
	imageSublabel: string;
	useOwnVisual: string;
	uploadOwnVisual: string;
	uploadOwnDesign: string;
	chooseFromExistingIcons: string;
	selectFromMyFiles: string;

	badgesLoaded: Promise<unknown>;
	loadingPromise: Promise<unknown>;
	allBadgesLoaded: boolean = false;
	badges: BadgeClass[] = null;
	badgeResults: BadgeResult[] = null;
	badgesFormArray: any;

	badgeResultsByIssuer: MatchingBadgeIssuer[] = [];
	badgeResultsByCategory: MatchingBadgeCategory[] = [];
	selectedTag: string = null;
	order = 'asc';
	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	private _groupBy = '---';
	get groupBy() {
		return this._groupBy;
	}
	set groupBy(val: string) {
		this._groupBy = val;
		this.updateResults();
	}

	get imageFieldDirty() {
		return (
			this.learningPathForm.controls.badge_image.dirty || this.learningPathForm.controls.badge_customImage.dirty
		);
	}

	selectMinBadgesOptions: FormFieldSelectOption[] = [];

	constructor(
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected learningPathApiService: LearningPathApiService,
		protected issuerManager: IssuerManager,
		protected issuerApiService: IssuerApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected badgeClassService: BadgeClassManager,
		protected badgeClassApiService: BadgeClassApiService,
		private translate: TranslateService,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected learningPathManager: LearningPathManager,
		protected configService: AppConfigService,
	) {
		// protected title: Title,
		super(router, route, loginService);
		this.baseUrl = this.configService.apiConfig.baseUrl;
		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
		});
		this.badgesLoaded = this.loadBadges();
	}
	next: string;
	previous: string;

	draggableList: {
		id: string;
		name: string;
		image: any;
		description: string;
		slug: string;
		issuerName: string;
		order: number;
	}[] = [];

	ngOnChanges(changes: SimpleChanges) {
		let shouldInitialize = false;

		if (changes['learningPath'] && changes['learningPath'].currentValue) {
			this.initialisedLearningpath = changes['learningPath'].currentValue;
			shouldInitialize = true;
		}

		if (changes['lpBadge'] && changes['lpBadge'].currentValue) {
			this.existingLpBadge = changes['lpBadge'].currentValue;
			shouldInitialize = true;
		}

		// Only initialize if both values are available
		if (shouldInitialize && this.initialisedLearningpath && this.existingLpBadge) {
			this.initFormFromExisting(this.initialisedLearningpath, this.existingLpBadge);
		}
	}

	ngOnInit() {
		this.fetchTags();
		if (!this.initialisedLearningpath) {
			this.learningPathForm.controls.license.addFromTemplate();
		}
		this.draggableList = this.selectedBadges.map((badge, index) => {
			return {
				id: badge.slug,
				name: badge.name,
				image: 'http://localhost:8000' + badge.image,
				description: badge.description,
				slug: badge.slug,
				issuerName: badge.issuerName,
				order: index,
			};
		});
		this.translate.get('General.next').subscribe((next) => {
			this.next = next;
		});
		this.translate.get('General.previous').subscribe((previous) => {
			this.previous = previous;
		});

		this.translate.get('Badge.category').subscribe((translatedText: string) => {
			this.groups[0] = translatedText;
		});

		this.translate.get('Badge.issuer').subscribe((translatedText: string) => {
			this.groups[1] = translatedText;
		});

		this.translate.get('CreateBadge.useOurEditor').subscribe((res: string) => {
			this.useOurEditor = res;
		});
		this.translate.get('CreateBadge.imageSublabel').subscribe((res: string) => {
			this.imageSublabel = res;
		});
		this.translate.get('CreateBadge.useOwnVisual').subscribe((res: string) => {
			this.useOwnVisual = res;
		});
		this.translate.get('RecBadge.uploadOwnVisual').subscribe((res: string) => {
			this.uploadOwnVisual = res;
		});
		this.translate.get('CreateBadge.uploadOwnDesign').subscribe((res: string) => {
			this.uploadOwnDesign = res;
		});
		this.translate.get('RecBadge.chooseFromExistingIcons').subscribe((res: string) => {
			this.chooseFromExistingIcons = res;
		});
		this.translate.get('RecBadge.selectFromMyFiles').subscribe((res: string) => {
			this.selectFromMyFiles = res;
		});

		if (!this.initialisedLearningpath) {
			// restore name and description from sessionStorage
			const sessionValuesJSON = sessionStorage.getItem('oeb-create-badgeclassvalues');
			if (sessionValuesJSON) {
				const sessionValues = JSON.parse(sessionValuesJSON);
				this.learningPathForm.rawControl.patchValue({
					name: sessionValues['badge_name'] || '',
					description: sessionValues['badge_description'] || '',
				});
			}
			// save name and description to sessionStorage on Change
			this.learningPathForm.rawControl.valueChanges.subscribe((v) => {
				let saveableSessionValues = {};
				for (const [k, v] of Object.entries(this.learningPathForm.rawControl.value)) {
					if (['name', 'description'].includes(k)) {
						saveableSessionValues['badge_' + k] = v;
					}
				}
				sessionStorage.setItem('oeb-create-badgeclassvalues', JSON.stringify(saveableSessionValues));
			});
		} else {
			// clear session storage when editing existing badges
			sessionStorage.removeItem('oeb-create-badgeclassvalues');
		}
	}

	initFormFromExisting(lp: LearningPath, badge: BadgeClass) {
		if (!lp || !badge) return;

		this.learningPathForm.setValue({
			name: lp.name,
			description: lp.description,
			badge_category: 'learningpath',
			badge_image: badge.imageFrame ? lp.participationBadgeImage : null,
			badge_customImage: !badge.imageFrame ? lp.participationBadgeImage : null,
			useIssuerImageInBadge: true,
			activated: lp.activated,
			badges: lp.badges,
			required_badges_count: lp.required_badges_count,
			license: [
				{
					id: 'CC-0',
					name: 'Public Domain',
					legalCode: 'https://creativecommons.org/publicdomain/zero/1.0/legalcode',
				},
			],
		});
		this.selectedBadges = lp.badges.map((b) => b.badge);

		this.currentImage = badge.extension['extensions:OrgImageExtension']
			? badge.extension['extensions:OrgImageExtension'].OrgImage
			: undefined;

		console.log('current image', this.currentImage);

		setTimeout(() => {
			if (badge.imageFrame) {
				this.generateUploadImage(this.currentImage, this.learningPathForm.value, true);
			}
		}, 1);

		lp.tags.forEach((t) => this.lpTags.add(t));
	}

	badgeChecked(badge: BadgeClass) {
		return this.selectedBadges.some((b) => b.slug == badge.slug);
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openDangerDialog(index: number) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				delete: () => {
					this.draggableList.splice(index, 1);
				},
				variant: 'danger',
				text: 'Are you sure you want to remove this badge from the learningpath?',
			},
		});
	}

	// checkboxChange(event, index: number) {
	// 	if (!event) {
	// 		this.openDangerDialog(index);
	// 	}
	// }

	validateFields(fields: string[]) {
		return fields.every((c) => {
			return this.learningPathForm.controls[c].valid;
		});
	}

	dirtyFields(fields: string[]) {
		return fields.every((c) => {
			return this.learningPathForm.controls[c].dirty;
		});
	}

	checkboxChange(event, badge: BadgeClass) {
		if (event) {
			this.selectedBadges.push(badge);
			this.learningPathForm.controls.badges.push(typedFormGroup().addControl('badge', badge));
			this.studyLoad += badge.extension['extensions:StudyLoadExtension'].StudyLoad;
		} else {
			this.selectedBadges.splice(this.selectedBadges.indexOf(badge), 1);
			this.learningPathForm.controls.badges.removeAt(
				this.learningPathForm.controls.badges.value.findIndex((badge) => badge.badge === badge),
			);
			this.studyLoad -= badge.extension['extensions:StudyLoadExtension'].StudyLoad;
		}
		this.draggableList = this.selectedBadges.map((badge, index) => {
			return {
				id: badge.slug,
				name: badge.name,
				image: badge.image,
				description: badge.description,
				slug: badge.slug,
				issuerName: badge.issuerName,
				order: index,
			};
		});
	}
	groups: string[] = [];
	// groups = [this.translate.instant('Badge.category'), this.translate.instant('Badge.issuer'), '---'];
	categoryOptions: { [key in BadgeClassCategory | 'noCategory']: string } = {
		competency: '',
		participation: '',
		learningpath: '',
		noCategory: '',
	};

	// updateTags(tags: string[]) {
	// 	this.lpTags = tags;
	// }

	learningPathForm = typedFormGroup([this.imageValidation.bind(this), this.minSelectedBadges.bind(this)])
		.addControl('name', '', [Validators.required, Validators.maxLength(60)])
		.addControl('description', '', [Validators.required, Validators.maxLength(700)])
		.addControl('badge_image', '')
		.addControl('badge_category', 'learningpath')
		.addControl('badge_customImage', '')
		.addControl('useIssuerImageInBadge', true)
		.addControl('activated', false)
		.addArray('badges', typedFormGroup().addControl('badge', null, Validators.required))
		.addControl('required_badges_count', 3, Validators.required)
		.addArray(
			'license',
			typedFormGroup()
				.addControl('id', 'CC-0', Validators.required)
				.addControl('name', 'Public Domain', Validators.required)
				.addControl(
					'legalCode',
					'https://creativecommons.org/publicdomain/zero/1.0/legalcode',
					UrlValidator.validUrl,
				),
			Validators.required,
		);

	ngAfterViewInit() {
		this.focusActivation = this.route.snapshot.queryParamMap.get('focusActivation') === 'true';

		if (this.focusActivation && this.initialisedLearningpath && this.stepper) {
			this.focusActivationSection();
		}
		this.learningPathForm.controls.badge_image.rawControl.valueChanges.subscribe((value) => {
			if (this.imageField.control.value != null) this.customImageField.control.reset();
		});

		this.learningPathForm.controls.badge_customImage.rawControl.valueChanges.subscribe((value) => {
			if (this.customImageField.control.value != null) this.imageField.control.reset();
		});

		this.learningPathForm.controls.badges.rawControl.valueChanges.subscribe((value) => {
			if (Array.isArray(value)) {
				this.selectMinBadgesOptions = value
					.map((_, i) => ({
						label: String(i + 1),
						value: String(i + 1),
					}))
					.filter((v) => parseInt(v.value) != value.length && parseInt(v.value) >= 3)
					.reverse();

				this.selectMinBadgesOptions.unshift({ label: 'General.all', value: value.length.toString() });
			}
		});
	}

	private focusActivationSection() {
		if (this.focusActivation && this.activationSection && !this.hasScrolled) {
			// stepper being linear requires the steps to be marked as completed before changing the step index
			const steps = this.stepper.steps.toArray();
			for (let i = 0; i < 3; i++) {
				if (steps[i]) {
					steps[i].completed = true;
				}
			}
			this.stepper.selectedIndex = 3;
			if (this.activationSection.nativeElement.offsetTop > 0) this.hasScrolled = true;
			this.activationSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	generateRandomImage() {
		this.badgeStudio
			.generateRandom()
			.then((imageUrl) => this.imageField.useDataUrl(imageUrl, 'Auto-generated image'));
	}

	generateUploadImage(image, formdata, useIssuerImageInBadge = false) {
		this.currentImage = image.slice();
		this.badgeStudio
			.generateUploadImage(image.slice(), formdata, useIssuerImageInBadge, this.issuer.image)
			.then((imageUrl) => {
				this.imageField.useDataUrl(imageUrl, 'BADGE');
			});
	}

	generateCustomUploadImage(image) {
		if (base64ByteSize(image) > this.maxCustomImageSize) {
			this.isCustomImageLarge = true;
			return;
		}
		this.currentImage = image.slice();
		this.customImageField.useDataUrl(image, 'BADGE');
	}

	onStepChange(event: any): void {
		// this.learningPathForm.markTreeDirtyAndValidate();
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get lpSlug() {
		return this.route.snapshot.params['learningPathSlug'];
	}

	cancelClicked() {
		this.cancel.emit();
	}

	async loadBadges() {
		this.badges = [];
		this.badgeResults = [];
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.badgesByIssuerUrl$.subscribe(
				(badges) => {
					Object.values(badges).forEach((badgeList) => {
						this.badges.push(
							...badgeList
								.slice()
								.filter(
									(b) =>
										b.extension['extensions:StudyLoadExtension'].StudyLoad > 0 &&
										b.extension['extensions:CategoryExtension'].Category !== 'learningpath',
								)
								.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
						);
						this.badgesFormArray = this.learningPathForm.controls.badges.value;
						this.tags = sortUnique(this.tags);
						this.issuers = sortUnique(this.issuers);
						this.updateResults();
					});

					this.badgeResults = this.badges;
					this.badgeResults.forEach((badge) => {
						this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
						this.tags = this.tags.concat(badge.tags);
						this.issuers = this.issuers.concat(badge.issuer);
					});
					this.tags = sortUnique(this.tags);
					this.issuers = sortUnique(this.issuers);
					this.updateResults();
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
			);
		});
	}

	loadAllBadges() {
		this.loadingPromise = this.loadAllPublicBadges();
	}
	async loadAllPublicBadges() {
		return new Promise(async (resolve, reject) => {
			this.badgeClassService.allPublicBadges$.subscribe(
				(badges) => {
					this.badges = badges
						.slice()
						.filter((b) => b.extension['extensions:StudyLoadExtension'].StudyLoad > 0)
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					this.badgeResults = this.badges;

					this.badgesFormArray = this.learningPathForm.controls.badges.value;
					badges.forEach((badge) => {
						this.badgesFormArray.push({ badge: badge, order: 0, selected: false });
						this.tags = this.tags.concat(badge.tags);
						this.issuers = this.issuers.concat(badge.issuer);
					});

					this.tags = sortUnique(this.tags);
					this.issuers = sortUnique(this.issuers);
					this.updateResults();
					this.allBadgesLoaded = true;
					resolve(badges);
				},
				(error) => {
					this.messageService.reportAndThrowError('Failed to load badges', error);
				},
			);
		});
	}
	private badgeMatcher(inputPattern: string): (badge) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);
		return (badge) => StringMatchingUtil.stringMatches(badge.name, patternStr, patternExp);
	}
	private badgeTagMatcher(tag: string) {
		return (badge) => (tag ? badge.tags.includes(tag) : true);
	}

	changeOrder(order) {
		this.order = order;
		if (this.order === 'asc') {
			this.badgeResults.sort((a, b) => a.name.localeCompare(b.name));
			this.badgeResultsByIssuer
				.sort((a, b) => a.issuerName.localeCompare(b.issuerName))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
			this.badgeResultsByCategory
				.sort((a, b) => a.category.localeCompare(b.category))
				.forEach((r) => r.badges.sort((a, b) => a.name.localeCompare(b.name)));
		} else {
			this.badgeResults.sort((a, b) => b.name.localeCompare(a.name));
			this.badgeResultsByIssuer
				.sort((a, b) => b.issuerName.localeCompare(a.issuerName))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
			this.badgeResultsByCategory
				.sort((a, b) => b.category.localeCompare(a.category))
				.forEach((r) => r.badges.sort((a, b) => b.name.localeCompare(a.name)));
		}
	}

	private updateResults() {
		let that = this;
		// Clear Results
		this.badgeResults = [];
		this.badgeResultsByIssuer = [];
		const badgeResultsByIssuerLocal = {};
		this.badgeResultsByCategory = [];
		const badgeResultsByCategoryLocal = {};
		var addBadgeToResultsByIssuer = function (item) {
			let issuerResults = badgeResultsByIssuerLocal[item.issuerName];
			if (!issuerResults) {
				issuerResults = badgeResultsByIssuerLocal[item.issuerName] = new MatchingBadgeIssuer(
					item.issuerName,
					'',
				);
				// append result to the issuerResults array bound to the view template.
				that.badgeResultsByIssuer.push(issuerResults);
			}
			issuerResults.addBadge(item);
			return true;
		};
		var addBadgeToResultsByCategory = function (item) {
			let itemCategory =
				item.extension && item.extension['extensions:CategoryExtension']
					? item.extension['extensions:CategoryExtension'].Category
					: 'noCategory';
			let categoryResults = badgeResultsByCategoryLocal[itemCategory];
			if (!categoryResults) {
				categoryResults = badgeResultsByCategoryLocal[itemCategory] = new MatchingBadgeCategory(
					itemCategory,
					'',
				);
				// append result to the categoryResults array bound to the view template.
				that.badgeResultsByCategory.push(categoryResults);
			}
			categoryResults.addBadge(item);
			return true;
		};
		this.badges
			.filter(this.badgeMatcher(this.searchQuery))
			.filter(this.badgeTagMatcher(this.selectedTag))
			.filter((i) => !i.apiModel.source_url)
			.forEach((item) => {
				that.badgeResults.push(item);
				addBadgeToResultsByIssuer(item);
				addBadgeToResultsByCategory(item);
			});
	}

	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';

	/**
	 * Indicates wether the existing tags are currently being loaded.
	 * It is set in @see fetchTags
	 */
	existingTagsLoading: boolean;

	/**
	 * The already existing tags for other badges, for the autocomplete to show.
	 * The tags are loaded in @see fetchTags
	 */
	existingTags: { id: number; name: string }[];

	tagOptions: FormFieldSelectOption[];

	lpTags = new Set<string>();

	/**
	 * Fetches the tags from the @see badgeClassManager and selects the tags from them.
	 * The tags are then assigned to @see existingTags in an appropriate format.
	 * At the beginning, @see existingTagsLoading is set, once tags are loaded it's unset.
	 */
	fetchTags() {
		this.existingTags = [];
		this.existingTagsLoading = true;
		// outerThis is needed because inside the observable, `this` is something else
		let outerThis = this;
		let observable = this.learningPathManager.allLearningPaths$;

		observable.subscribe({
			next(entities: LearningPath[]) {
				let tags: string[] = entities.flatMap((entity) => entity.tags);
				let unique = [...new Set(tags)];
				unique.sort();
				outerThis.existingTags = unique.map((tag, index) => ({
					id: index,
					name: tag,
				}));
				outerThis.tagOptions = outerThis.existingTags.map(
					(tag) =>
						({
							value: tag.name,
							label: tag.name,
						}) as FormFieldSelectOption,
				);
				// The tags are loaded in one badge, so it's save to assume
				// that after the first `next` call, the loading is done
				outerThis.existingTagsLoading = false;
			},
			error(err) {
				console.error("Couldn't fetch labels: " + err);
			},
		});
	}

	addTag() {
		const newTag = (this.newTagInput['query'] || '').trim().toLowerCase();

		if (newTag.length > 0) {
			this.lpTags.add(newTag);

			this.newTagInput['query'] = '';
		}
	}

	handleTagInputKeyPress(event: KeyboardEvent) {
		if (event.keyCode === 13 /* Enter */) {
			this.addTag();
			this.newTagInput.nativeElement.focus();
			event.preventDefault();
		}
	}

	onDragged(item: any, list: any[], effect: DropEffect) {
		const index = list.indexOf(item);
		list.splice(index, 1);
		this.recalculateOrder(list);
	}

	onDrop(event: DndDropEvent, index: number, list: any[]) {
		const previousIndex = list.findIndex((item) => item.id === event.data.id);

		if (previousIndex !== -1) {
			list.splice(previousIndex, 1);
		}

		if (typeof index === 'undefined') {
			index = list.length;
		}

		list.splice(index, 0, event.data);
		this.recalculateOrder(list);
	}

	recalculateOrder(list: any[]) {
		list.forEach((item, index) => {
			item.order = index;
		});
	}

	removeTag(tag: string) {
		this.lpTags.delete(tag);
	}

	async onSubmit() {
		const studyLoadExtensionContextUrl = `${this.baseUrl}/static/extensions/StudyLoadExtension/context.json`;
		const categoryExtensionContextUrl = `${this.baseUrl}/static/extensions/CategoryExtension/context.json`;
		const licenseExtensionContextUrl = `${this.baseUrl}/static/extensions/LicenseExtension/context.json`;
		const competencyExtensionContextUrl = `${this.baseUrl}/static/extensions/CompetencyExtension/context.json`;

		const criteriaText =
			'*Folgende Kriterien sind auf Basis deiner Eingaben als Metadaten im Badge hinterlegt*: \n\n';
		const participationText = `Du hast erfolgreich an **${this.learningPathForm.controls.name.value}** teilgenommen.  \n\n `;

		if (this.initialisedLearningpath && this.lpBadge) {
			const formState = this.learningPathForm.value;

			this.existingLpBadge.imageFrame =
				this.learningPathForm.controls.badge_customImage.value && this.learningPathForm.valid ? false : true;
			this.existingLpBadge.image = this.learningPathForm.controls.badge_image.value;
			(this.existingLpBadge.name = this.learningPathForm.controls.name.value),
				(this.existingLpBadge.description = this.learningPathForm.controls.description.value),
				(this.existingLpBadge.tags = Array.from(this.lpTags)),
				(this.existingLpBadge.criteria_text = criteriaText),
				(this.existingLpBadge.criteria_url = ''),
				(this.existingLpBadge.extension = {
					'extensions:StudyLoadExtension': {
						'@context': studyLoadExtensionContextUrl,
						type: ['Extension', 'extensions:StudyLoadExtension'],
						StudyLoad: this.studyLoad,
					},
					'extensions:CategoryExtension': {
						'@context': categoryExtensionContextUrl,
						type: ['Extension', 'extensions:CategoryExtension'],
						Category: 'learningpath',
					},
					'extensions:LicenseExtension': {
						'@context': licenseExtensionContextUrl,
						type: ['Extension', 'extensions:LicenseExtension'],
						id: this.learningPathForm.value.license[0].id,
						name: this.learningPathForm.value.license[0].name,
						legalCode: this.learningPathForm.value.license[0].legalCode,
					},
					'extensions:CompetencyExtension': [],
				});

			this.existingLpBadge.save();

			this.initialisedLearningpath.name = formState.name;
			this.initialisedLearningpath.description = formState.description;
			this.initialisedLearningpath.activated = formState.activated;
			this.initialisedLearningpath.issuer_id = this.issuer.slug;
			this.initialisedLearningpath.tags = Array.from(this.lpTags);
			this.initialisedLearningpath.required_badges_count = Number(formState.required_badges_count);
			this.initialisedLearningpath.badges = this.draggableList.map((item, index) => {
				return {
					badge: this.selectedBadges.find((b) => b.slug == item.slug),
					order: item.order,
				};
			});

			this.savePromise = this.initialisedLearningpath.save();

			this.save.emit(this.savePromise);

			// clear sessionStorage
			sessionStorage.removeItem('oeb-create-badgeclassvalues');
		} else {
			this.savePromise = (async () => {
				try {
					let imageFrame = true;
					if (this.learningPathForm.controls.badge_customImage.value && this.learningPathForm.valid) {
						imageFrame = false;
						this.learningPathForm.controls.badge_image.setValue(
							this.learningPathForm.controls.badge_customImage.value,
						);
					}

					const participationBadge = await this.badgeClassService.createBadgeClass(this.issuerSlug, {
						image: this.learningPathForm.controls.badge_image.value,
						imageFrame: imageFrame,
						name: this.learningPathForm.controls.name.value,
						description: this.learningPathForm.controls.description.value,
						tags: Array.from(this.lpTags),
						criteria_text: criteriaText,
						criteria_url: '',
						extensions: {
							'extensions:StudyLoadExtension': {
								'@context': studyLoadExtensionContextUrl,
								type: ['Extension', 'extensions:StudyLoadExtension'],
								StudyLoad: this.studyLoad,
							},
							'extensions:CategoryExtension': {
								'@context': categoryExtensionContextUrl,
								type: ['Extension', 'extensions:CategoryExtension'],
								Category: 'learningpath',
							},
							'extensions:LicenseExtension': {
								'@context': licenseExtensionContextUrl,
								type: ['Extension', 'extensions:LicenseExtension'],
								id: this.learningPathForm.value.license[0].id,
								name: this.learningPathForm.value.license[0].name,
								legalCode: this.learningPathForm.value.license[0].legalCode,
							},
							'extensions:CompetencyExtension': [],
						},
						copy_permissions: ['issuer'],
					});

					const issuer = await this.issuerApiService.getIssuer(this.issuerSlug);

					this.savePromise = this.learningPathManager.createLearningPath(this.issuerSlug, {
						issuer_id: issuer.slug,
						name: this.learningPathForm.controls.name.value,
						description: this.learningPathForm.controls.description.value,
						tags: Array.from(this.lpTags),
						badges: this.draggableList.map((item, index) => {
							return {
								slug: item.slug,
								order: index,
							};
						}),
						required_badges_count: Number(this.learningPathForm.controls.required_badges_count.value),
						participationBadge_id: participationBadge.slug,
						activated: this.learningPathForm.controls.activated.value,
					});

					this.save.emit(this.savePromise);
					// clear sessionStorage
					sessionStorage.removeItem('oeb-create-badgeclassvalues');
				} catch (e) {
					this.savePromise = null;
					console.log(e);
				}
			})();
		}
	}

	imageValidation(): ValidationErrors | null {
		if (!this.learningPathForm) return null;

		const value = this.learningPathForm.value;

		const image = (value.badge_image || '').trim();
		const customImage = (value.badge_customImage || '').trim();
		// To hide custom-image large size error msg
		this.isCustomImageLarge = false;

		if (!image.length && !customImage.length) {
			return { imageRequired: true };
		}
	}

	minSelectedBadges(): ValidationErrors | null {
		return this.selectedBadges.length >= 3
			? null
			: { minSelectedBadges: { required: 3, actual: this.selectedBadges.length } };
	}
}

class MatchingBadgeIssuer {
	constructor(
		public issuerName: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}
	async addBadge(badge) {
		if (badge.issuerName === this.issuerName) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}
class MatchingBadgeCategory {
	constructor(
		public category: string,
		public badge,
		public badges: BadgeClass[] = [],
	) {}
	async addBadge(badge) {
		if (
			badge.extension &&
			badge.extension['extensions:CategoryExtension'] &&
			badge.extension['extensions:CategoryExtension'].Category === this.category
		) {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		} else if (!badge.extension['extensions:CategoryExtension'] && this.category == 'noCategory') {
			if (this.badges.indexOf(badge) < 0) {
				this.badges.push(badge);
			}
		}
	}
}
