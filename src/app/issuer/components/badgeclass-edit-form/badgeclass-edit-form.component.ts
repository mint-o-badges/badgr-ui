import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, Validators, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Md5 } from 'ts-md5/dist/md5';

import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';

import {
	ApiBadgeClassForCreation,
	BadgeClassCategory,
	BadgeClassExpiresDuration,
	BadgeClassLevel,
} from '../../models/badgeclass-api.model';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeStudioComponent } from '../badge-studio/badge-studio.component';
import { BgFormFieldImageComponent } from '../../../common/components/formfield-image';
import { UrlValidator } from '../../../common/validators/url.validator';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';

import { AiSkillsService } from '../../../common/services/ai-skills.service';
import { Skill } from '../../../common/model/ai-skills.model';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@angular/cdk/platform';	// To detect the current platform by comparing the userAgent strings

@Component({
	selector: 'badgeclass-edit-form',
	templateUrl: './badgeclass-edit-form.component.html',
	styleUrl: './badgeclass-edit-form.component.css',
})
export class BadgeClassEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit, AfterViewInit {
	baseUrl: string;
	badgeCategory: string;

	// Translation
	selectFromMyFiles = this.translate.instant('RecBadge.selectFromMyFiles');
	chooseFromExistingIcons = this.translate.instant('RecBadge.chooseFromExistingIcons');
	uploadOwnVisual = this.translate.instant('RecBadge.uploadOwnVisual');

	chooseABadgeCategory = this.translate.instant('CreateBadge.chooseABadgeCategory');
	summarizedDescription = this.translate.instant('CreateBadge.summarizedDescription') + '(max 700 ' + this.translate.instant('General.characters') + '). ' + this.translate.instant('CreateBadge.descriptionSavedInBadge');
	enterDescription = this.translate.instant('Issuer.enterDescription');
	max60chars = '(max 60 ' + this.translate.instant('General.characters') + ')';

	useOurEditor = this.translate.instant('CreateBadge.useOurEditor');
	imageSublabel = this.translate.instant('CreateBadge.imageSublabel');
	useOwnVisual = this.translate.instant('CreateBadge.useOwnVisual');
	uploadOwnDesign = this.translate.instant('CreateBadge.uploadOwnDesign');
	imageErrorFork = this.translate.instant('CreateBadge.imageErrorFork');

	detailedDescription = this.translate.instant('CreateBadge.detailedDescription');
	competencyTitle = this.translate.instant('Badge.competency') + '-' + this.translate.instant('Badge.title');
	titleError = this.translate.instant('CreateBadge.titleError');
	competencyDuration = this.translate.instant('CreateBadge.competencyDuration');
	competencyCategory = this.translate.instant('Badge.competency') + '-' + this.translate.instant('Badge.category');
	competencyCategoryError = this.translate.instant('CreateBadge.competencyCategoryError');
	competencyDescription =
		this.translate.instant('Badge.competency') + '-' + this.translate.instant('General.description');

	shortDescription = this.translate.instant('CreateBadge.shortDescription');
	alignmentNameError = this.translate.instant('CreateBadge.alignmentNameError');
	alignmentURLError = this.translate.instant('CreateBadge.alignmentURLError');

	count = this.translate.instant('General.count');
	duration = this.translate.instant('RecBadgeDetail.duration');
	chooseDuration = this.translate.instant('CreateBadge.chooseDuration');
	newTag = this.translate.instant('CreateBadge.newTag');

	suggestCompetenciesText = this.translate.instant('CreateBadge.suggestCompetencies');

	giveBadgeTitle = this.translate.instant('CreateBadge.giveBadgeTitle');
	changeBadgeTitle = this.translate.instant('CreateBadge.changeBadgeTitle');

	maxValue1000 = this.translate.instant('CreateBadge.maxValue1000');

	@Input()
	set badgeClass(badgeClass: BadgeClass) {
		if (this.existingBadgeClass !== badgeClass) {
			this.existingBadgeClass = badgeClass;
			this.existing = true;
			this.initFormFromExisting(this.existingBadgeClass);
		}
	}

	@Input()
	set initBadgeClass(badgeClass: BadgeClass) {
		if (this.initialisedBadgeClass !== badgeClass) {
			this.initialisedBadgeClass = badgeClass;
			this.initFormFromExisting(this.initialisedBadgeClass);
		}
	}

	/**
	 * Wether or not the badge class that is being worked on is forked.
	 * This field is required to reduce the possibility of misordering @link initBadgeClass and isForked
	 * calls (isForked has to be set first).
	 * If not set, an error is logged and it is interpreted as `false`.
	 */
	@Input()
	set isForked(isBadgeClassForked: boolean | string) {
		// Parameters from HTML are passed as string, even if the type of the parameter
		// is set to boolean
		if (typeof isBadgeClassForked == 'string') isBadgeClassForked = isBadgeClassForked == 'true';
		this.isBadgeClassForked = isBadgeClassForked;
	}

	get badgeClass() {
		return this.initialisedBadgeClass ? this.initialisedBadgeClass : this.existingBadgeClass;
	}

	get alignmentFieldDirty() {
		return (
			this.badgeClassForm.controls.badge_criteria_text.dirty ||
			this.badgeClassForm.controls.badge_criteria_url.dirty
		);
	}

	get imageFieldDirty() {
		return this.badgeClassForm.controls.badge_image.dirty || this.badgeClassForm.controls.badge_customImage.dirty;
	}

	readonly badgeClassPlaceholderImageUrl = '../../../../breakdown/static/images/placeholderavatar.svg';

	/**
	 * The name the badge is not allowed to have.
	 * This is used to enforce a change of the pattern when forking a badge.
	 */
	forbiddenName: string | null = null;
	/**
	 * The image the badge is not allowed to have.
	 * This is used to enforce a change of the pattern when forking a badge.
	 */
	forbiddenImage: string | null = null;

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

	/**
	 * The description of the competencies entered by the user
	 * for the AI tool
	 */
	aiCompetenciesDescription: string = '';

	/**
	 * The suggested competencies regarding the description
	 * from the user (@see aiCompetenciesDescription)
	 */
	aiCompetenciesSuggestions: Skill[] = [];

	/**
	 * The descriptions of suggested competencies which are shown
	 * in the view (@see aiCompetenciesSuggestions)
	 */

	savePromise: Promise<BadgeClass> | null = null;
	badgeClassForm = typedFormGroup([
        this.criteriaRequired.bind(this),
        this.imageValidation.bind(this),
        this.noDuplicateCompetencies.bind(this)])
		.addControl('badge_name', '', [
			Validators.required,
			Validators.maxLength(60),
			// Validation that the name of a fork changed
			(control: AbstractControl): ValidationErrors | null =>
				this.forbiddenName && this.forbiddenName == control.value
					? { mustChange: { value: control.value } }
					: null,
		])
		.addControl('badge_image', '')
		.addControl('badge_customImage', '')
		.addControl('badge_description', '', [Validators.required, Validators.maxLength(700)])
		.addControl('badge_criteria_url', '')
		.addControl('badge_criteria_text', '')
		.addControl('badge_study_load', 0, [this.positiveIntegerOrNull, Validators.max(10000)])
		.addControl('badge_category', '', Validators.required)
		.addControl('badge_level', 'a1', Validators.required)
		.addControl('badge_based_on', {
			slug: '',
			issuerSlug: '',
		})
		.addArray(
			'aiCompetencies',
			typedFormGroup()
				.addControl('selected', false)
				// Technically this is only required if selected,
				// but since it doesn't make sense to remove the
				// default of 60 from unselected suggestions,
				// this doesn't really matter
				.addControl('studyLoad', 60, [Validators.required, this.positiveInteger]),
		)
		.addArray(
			'competencies',
			typedFormGroup()
				.addControl('added', false)
				.addControl('name', '', Validators.required)
				.addControl('description', '', Validators.required)
				.addControl('escoID', '')
				// limit of 1000000 is set so that users cant break the UI by entering a very long number
				.addControl('studyLoad', 60, [Validators.required, this.positiveInteger, Validators.max(1000000)])
				.addControl('category', '', Validators.required),
		)
		.addArray(
			'alignments',
			typedFormGroup()
				.addControl('target_name', '', Validators.required)
				.addControl('target_url', '', [Validators.required, UrlValidator.validUrl])
				.addControl('target_description', '')
				.addControl('target_framework', '')
				.addControl('target_code', ''),
		);		
	@ViewChild('badgeStudio')
	badgeStudio: BadgeStudioComponent;

	@ViewChild('imageField')
	imageField: BgFormFieldImageComponent;

	@ViewChild('customImageField')
	customImageField: BgFormFieldImageComponent;

	@ViewChild('newTagInput')
	newTagInput: ElementRef<HTMLInputElement>;

	@ViewChild('formElem')
	formElem: ElementRef<HTMLFormElement>;

	@ViewChild('imageSection') imageSection!: ElementRef<HTMLElement>;

	existingBadgeClass: BadgeClass | null = null;

	initialisedBadgeClass: BadgeClass | null = null;

	badgeClassesLoadedPromise: Promise<unknown>;
	badgeClasses: BadgeClass[] | null;
	selectedBadgeClasses: BadgeClass[] = [];

	/**
	 * Indicates wether or not the @link initialisedBadgeClass is forked
	 */
	isBadgeClassForked: boolean | null = null;

	@Output()
	save = new EventEmitter<Promise<BadgeClass>>();

	@Output()
	cancel = new EventEmitter<void>();

	@Input()
	issuerSlug: string;

	@Input()
	submitText: string;

	@Input()
	submittingText: string;

	@Input()
	scrolled: boolean;

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Tags
	tags = new Set<string>();

	collapsedCompetenciesOpen = false

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Expiration
	expirationEnabled = false;
	expirationForm = typedFormGroup()
		.addControl('expires_amount', '', [Validators.required, this.positiveInteger, Validators.max(1000)])
		.addControl('expires_duration', '', Validators.required);

	durationOptions: { [key in BadgeClassExpiresDuration]: string } = {
		days: this.translate.instant('General.days'),
		weeks: this.translate.instant('General.weeks'),
		months: this.translate.instant('General.months'),
		years: this.translate.instant('General.years'),
	};

	categoryOptions: { [key in BadgeClassCategory]: string } = {
		competency: this.translate.instant('Badge.competency'),
		participation: this.translate.instant('Badge.participation'),
	};

	competencyCategoryOptions = {
		skill: this.translate.instant('Badge.skill'),
		knowledge: this.translate.instant('Badge.knowledge'),
	};

	levelOptions: { [key in BadgeClassLevel]: string } = {
		a1: 'A1 Einsteiger*in',
		a2: 'A2 Entdecker*in',
		b1: 'B1 Insider*in',
		b2: 'B2 Expert*in',
		c1: 'C1 Leader*in',
		c2: 'C2 Vorreiter*in',
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Alignments
	alignmentsEnabled = false;
	showAdvanced: boolean[] = [false];

	currentImage;
	initedCurrentImage = false;
	existing = false;
	showLegend = false;

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected fb: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		private configService: AppConfigService,
		protected badgeClassManager: BadgeClassManager,
		protected dialogService: CommonDialogsService,
		protected componentElem: ElementRef<HTMLElement>,
		protected aiSkillsService: AiSkillsService,
		private translate: TranslateService,
		private platformService: Platform,
	) {
		super(router, route, sessionService);
		title.setTitle(`Create Badge - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	initFormFromExisting(badgeClass: BadgeClass) {
		if (!badgeClass) return;

		if (this.isBadgeClassForked === null) {
			console.error('Missing information on wether the init badge is forked!');
			this.isBadgeClassForked = false;
		}

		if (this.isBadgeClassForked) {
			// Store the "old" name and image (hash) to later verify that it changed
			this.forbiddenName = badgeClass.name;
			this.forbiddenImage = badgeClass.extension['extensions:OrgImageExtension']?.OrgImage
				? new Md5().appendStr(badgeClass.extension['extensions:OrgImageExtension'].OrgImage).end()
				: null;
		} else {
			this.forbiddenName = null;
			this.forbiddenImage = null;
		}

		this.badgeClassForm.setValue({
			badge_name: badgeClass.name,
			badge_image: this.existing && badgeClass.imageFrame ? badgeClass.image : null, // Setting the image here is causing me a lot of problems with events being triggered, so I resorted to just set it in this.imageField...
			badge_customImage: this.existing && !badgeClass.imageFrame ? badgeClass.image : null,
			badge_description: badgeClass.description,
			badge_criteria_url: badgeClass.criteria_url,
			badge_criteria_text: badgeClass.criteria_text,
			badge_study_load: badgeClass.extension['extensions:StudyLoadExtension']
				? badgeClass.extension['extensions:StudyLoadExtension'].StudyLoad
				: null,
			badge_category: badgeClass.extension['extensions:CategoryExtension']
				? badgeClass.extension['extensions:CategoryExtension'].Category
				: null,
			badge_level: badgeClass.extension['extensions:LevelExtension']
				? badgeClass.extension['extensions:LevelExtension'].Level
				: null,
			badge_based_on: {
				slug: badgeClass.slug,
				issuerSlug: badgeClass.issuerSlug,
			},
			// Note that, even though competencies might originally have been selected
			// based on ai suggestions, they can't be separated anymore and thus will
			// be displayed as competencies entered by hand
			aiCompetencies: [],
			competencies: badgeClass.extension['extensions:CompetencyExtension']
				? badgeClass.extension['extensions:CompetencyExtension']
				: [],
			alignments: this.badgeClass.alignments.map((alignment) => ({
				target_name: alignment.target_name,
				target_url: alignment.target_url,
				target_description: alignment.target_description,
				target_framework: alignment.target_framework,
				target_code: alignment.target_code,
			})),
		});
		if(this.badgeClassForm.controls.competencies.controls.length > 0){
			this.collapsedCompetenciesOpen = true;
		};

		this.currentImage = badgeClass.extension['extensions:OrgImageExtension']
			? badgeClass.extension['extensions:OrgImageExtension'].OrgImage
			: undefined;
		this.tags = new Set();
		this.badgeClass.tags.forEach((t) => this.tags.add(t));

		this.alignmentsEnabled = this.badgeClass.alignments.length > 0;
		if (badgeClass.expiresAmount && badgeClass.expiresDuration) {
			this.enableExpiration();
		}
	}

	ngOnInit() {
		super.ngOnInit();
		let that = this;

		// Set badge category when editing a badge. As new select component doesn't show badge competencies
		this.badgeCategory = this.badgeClassForm.rawControl.controls['badge_category'].value; 
		if(this.badgeCategory === 'competency'){
			this.badgeClassForm.controls.competencies.addFromTemplate();
		}

		// update badge frame when a category is selected, unless no-hexagon-frame checkbox is checked
		this.badgeClassForm.rawControl.controls['badge_category'].statusChanges.subscribe((res) => {
			this.handleBadgeCategoryChange();
			if(that.imageField?.control.value){
				setTimeout(() => {
					that.adjustUploadImage(this.badgeClassForm.value);
				}, 10)
			}
			else if(that.customImageField?.control.value){
				if(!that.existing){
					setTimeout(() => {
					that.customImageField.useDataUrl(this.customImageField.control.value, 'BADGE');
					}, 10)
				}
			}
			// I am not sure why, but without calling adjustUploadImage here again, 
			// the image disappears while editing the badge
			// TODO: investigate why this is happening
			if (this.currentImage && this.existing) {
				if(that.imageField?.control.value){
					setTimeout(function () {
						that.adjustUploadImage(that.badgeClassForm.value);
					}, 10);
				}}
		});

		this.fetchTags();
	}

	ngAfterViewInit(): void {
		this.imageField.control.statusChanges.subscribe((e) => {
			if (this.imageField.control.value != null) this.customImageField.control.reset();
		});

		this.customImageField.control.statusChanges.subscribe((e) => {
			if (this.customImageField.control.value != null) this.imageField.control.reset();
		});
	}

	clearCompetencies() {
		const competencies = this.badgeClassForm.controls.competencies;
		competencies.reset();
		for (let i = competencies.length - 1; i >= 0; i--) {
			competencies.removeAt(i);
		}
	}

	async confirmCategoryChange(): Promise<boolean> {
		return await this.dialogService.confirmDialog.openTrueFalseDialog({
			dialogTitle: 'Wenn du die Kategorie änderst, werden alle Kompetenzen gelöscht.',
			dialogBody: 'Möchtest du fortfahren?',
			resolveButtonLabel: 'Fortfahren',
			rejectButtonLabel: 'Abbrechen',
		});
	}

	async handleBadgeCategoryChange() {
		const badgeCategoryControl = this.badgeClassForm.rawControl.controls['badge_category'];
		const currentBadgeCategory = badgeCategoryControl.value;

		if (this.badgeCategory === 'competency' && currentBadgeCategory !== 'competency') {
			if (await this.confirmCategoryChange()) {
				this.clearCompetencies();
			} else {
				this.badgeClassForm.controls['badge_category'].setValue(this.badgeCategory);
				return;
			}
		}
		if (currentBadgeCategory === 'competency') {
			this.badgeClassForm.controls.competencies.addFromTemplate();
		}
		this.badgeCategory = currentBadgeCategory;

		// fix the issue of missing badge-frame when changing type for first time (only with safari browser)
		// by regenerating the upload image as adjusting upload image didn't work with this issue
		if (this.platformService.SAFARI && this.currentImage) {
			this.generateUploadImage(this.currentImage, this.badgeClassForm.value);
		}
	}

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
		let observable = this.badgeClassManager.allBadges$;

		observable.subscribe({
			next(entities: BadgeClass[]) {
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
			this.tags.add(newTag);

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

	removeTag(tag: string) {
		this.tags.delete(tag);
	}

	enableExpiration() {
		const initialAmount = this.badgeClass ? this.badgeClass.expiresAmount : '';
		const initialDuration = this.badgeClass ? this.badgeClass.expiresDuration || '' : '';

		this.expirationEnabled = true;

		this.expirationForm.setValue({
			expires_amount: initialAmount.toString(),
			expires_duration: initialDuration.toString(),
		});
	}

	disableExpiration() {
		this.expirationEnabled = false;
		this.expirationForm.reset();
	}

	enableAlignments() {
		this.alignmentsEnabled = true;
		if (this.badgeClassForm.controls.alignments.length === 0) {
			this.addAlignment();
		}
	}

	addAlignment() {
		this.badgeClassForm.controls.alignments.addFromTemplate();
	}

	addCompetency(competency: typeof this.badgeClassForm.controls.competencies) {
		competency.markTreeDirty();
		if (competency.invalid) {
			return;
		}
		competency.controls['added'].setValue(true);
		// this.badgeClassForm.controls.competencies.addFromTemplate();
	}

	addAnotherCompetency(){
		this.badgeClassForm.controls.competencies.addFromTemplate();
	}

	/**
	 * Fetches competencies from the ai tool (@see aiSkillsService) and saves them
	 * in @see aiCompetenciesSuggestions. Also adds the necessary form control
	 * (@see badgeClassForm.controls.aiCompetencies) (and removes the old ones).
	 */
	suggestCompetencies() {
		if (this.aiCompetenciesDescription.length == 0) {
			return;
		}
		this.aiSkillsService
			.getAiSkills(this.aiCompetenciesDescription)
			.then((skills) => {
				this.aiCompetenciesSuggestions = skills;
				let aiCompetencies = this.badgeClassForm.controls.aiCompetencies;
				for (let i = aiCompetencies.length - 1; i >= 0; i--) {
					aiCompetencies.removeAt(i);
				}

				skills.forEach((skill) => {
					aiCompetencies.addFromTemplate();
				});
			})
			.catch((error) => {
				this.messageService.reportAndThrowError(`Failed to obtain ai skills: ${error.message}`, error);
			});
	}

	async disableAlignments() {
		const isPlural = this.badgeClassForm.value.alignments.length > 1;
		if (
			!(await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: this.translate.instant('CreateBadge.removeAlignment') + (isPlural ? 's' : '') + '?',
				dialogBody:
					this.translate.instant('CreateBadge.removeAlignmentInfo') +
					this.translate.instant('CreateBadge.irreversibleAction'),
				resolveButtonLabel: this.translate.instant('General.remove'),
				rejectButtonLabel: this.translate.instant('General.cancel'),
			}))
		) {
			return;
		}
		this.alignmentsEnabled = false;
		this.badgeClassForm.setValue({
			...this.badgeClassForm.value,
			alignments: [],
		});
	}

	async removeAlignment(alignment: this['badgeClassForm']['controls']['alignments']['controls'][0]) {
		const value = alignment.value;

		if (
			(value.target_name || '').trim().length > 0 ||
			(value.target_url || '').trim().length > 0 ||
			(value.target_description || '').trim().length > 0 ||
			(value.target_framework || '').trim().length > 0 ||
			(value.target_code || '').trim().length > 0
		) {
			if (
				!(await this.dialogService.confirmDialog.openTrueFalseDialog({
					dialogTitle: this.translate.instant('CreateBadge.removeAlignment') + '?',
					dialogBody: this.translate.instant('CreateBadge.removeAlignmentInfo'),
					resolveButtonLabel:
						this.translate.instant('General.remove') + ' ' + this.translate.instant('Badge.alignment'),
					rejectButtonLabel: this.translate.instant('General.cancel'),
				}))
			) {
				return;
			}
		}

		this.badgeClassForm.controls.alignments.removeAt(
			this.badgeClassForm.controls.alignments.controls.indexOf(alignment),
		);
	}

	async removeCompetency(competency: this['badgeClassForm']['controls']['competencies']['controls'][0]) {
		const value = competency.value;

		if (
			(value.name || '').trim().length > 0 ||
			(value.description || '').trim().length > 0 ||
			(value.escoID || '').trim().length > 0 ||
			(value.category || '').trim().length > 0
		) {
			if (
				!(await this.dialogService.confirmDialog.openTrueFalseDialog({
					dialogTitle: this.translate.instant('EditBadge.removeCompetency') + '?',
					dialogBody: this.translate.instant('EditBadge.removeCompetencyInfo'),
					resolveButtonLabel: this.translate.instant('EditBadge.removeCompetency'),
					rejectButtonLabel: this.translate.instant('General.cancel'),
				}))
			) {
				return;
			}
		}

		this.badgeClassForm.controls.competencies.removeAt(
			this.badgeClassForm.controls.competencies.controls.indexOf(competency),
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	criteriaRequired(): { [id: string]: boolean } | null {
		if (!this.badgeClassForm) return null;

		const value = this.badgeClassForm.value;

		const criteriaUrl = (value.badge_criteria_url || '').trim();
		const criteriaText = (value.badge_criteria_text || '').trim();

		if (!criteriaUrl.length && !criteriaText.length) {
			return { criteriaRequired: true };
		} else {
			return null;
		}
	}

	imageValidation(): ValidationErrors | null {
		if (!this.badgeClassForm) return null;

		const value = this.badgeClassForm.value;

		const image = (value.badge_image || '').trim();
		const customImage = (value.badge_customImage || '').trim();

		if (!image.length && !customImage.length) {
			return { imageRequired: true };
		}

		// Validation that the image (hash) of a fork changed
		const controlValue = customImage || image;
		if (!controlValue || !this.forbiddenImage || !this.forbiddenImage) {
			return null;
		}
		const other = new Md5().appendStr(this.forbiddenImage).end();
		if (this.forbiddenImage != other) {
			return null;
		}
		return { mustChange: { value: this.forbiddenImage } };
	}

	async onSubmit() {
		try {
			if (this.badgeClassForm.rawControl.controls.badge_category.value === 'competency') {
				this.badgeClassForm.controls.competencies.rawControls.forEach((control, i) => {
					if (control.untouched && control.status === "INVALID") {
						this.badgeClassForm.controls.competencies.removeAt(i);
					}
				});
			}

			let criteriaText = "*Folgende Kriterien sind auf Basis deiner Eingaben als Metadaten im Badge hinterlegt*: \n\n"
			let participationText = `Du hast erfolgreich an **${this.badgeClassForm.value.badge_name}** teilgenommen.  \n\n `
			let competenciesTextCaption = "Dabei hast du folgende Kompetenzen gestärkt: \n\n"

			let competenciesText = this.badgeClassForm.value.competencies.map((competency) => {
				return `- ${competency.name} \n`
			}).join('');

			let aiCompetenciesText = this.badgeClassForm.controls.aiCompetencies.controls.map((aiCompetency, index) => {
				if(aiCompetency.controls.selected.value){
					return `- ${this.aiCompetenciesSuggestions[index].preferred_label} \n`
				}
			}).join('');

			if(this.badgeCategory === 'competency'){
				this.badgeClassForm.controls.badge_criteria_text.setValue(criteriaText + participationText + competenciesTextCaption + competenciesText + aiCompetenciesText );
			}else{
				this.badgeClassForm.controls.badge_criteria_text.setValue(criteriaText + participationText );	
			}

			let imageFrame = true
			if (this.badgeClassForm.controls.badge_customImage.value && this.badgeClassForm.valid) {
				imageFrame = false;
				this.badgeClassForm.controls.badge_image.setValue(this.badgeClassForm.controls.badge_customImage.value);
			}
			this.badgeClassForm.markTreeDirty();
			if (this.expirationEnabled) {
				this.expirationForm.markTreeDirty();
			}

			if (!this.badgeClassForm.valid || (this.expirationEnabled && !this.expirationForm.valid)) {
				const firstInvalidInput = this.formElem.nativeElement.querySelector(
					'.ng-invalid,.dropzone-is-error,.u-text-error',
				);
				if (firstInvalidInput) {
					if (typeof firstInvalidInput['focus'] === 'function') {
						firstInvalidInput['focus']();
					}
					if (firstInvalidInput.id == "imageTextError") {
						this.imageSection.nativeElement.scrollIntoView(true);
					} else {
						
						firstInvalidInput.scrollIntoView({ behavior: 'smooth' });
					}
				}
				return;
			}

			const formState = this.badgeClassForm.value;
			const expirationState = this.expirationEnabled ? this.expirationForm.value : undefined;

			const studyLoadExtensionContextUrl = `${this.baseUrl}/static/extensions/StudyLoadExtension/context.json`;
			const categoryExtensionContextUrl = `${this.baseUrl}/static/extensions/CategoryExtension/context.json`;
			const levelExtensionContextUrl = `${this.baseUrl}/static/extensions/LevelExtension/context.json`;
			const basedOnExtensionContextUrl = `${this.baseUrl}/static/extensions/BasedOnExtension/context.json`;
			const competencyExtensionContextUrl = `${this.baseUrl}/static/extensions/CompetencyExtension/context.json`;
			const orgImageExtensionContextUrl = `${this.baseUrl}/static/extensions/OrgImageExtension/context.json`;

			const suggestions = this.aiCompetenciesSuggestions;
			if (this.existingBadgeClass) {
				this.existingBadgeClass.name = formState.badge_name;
				this.existingBadgeClass.description = formState.badge_description;
				this.existingBadgeClass.image = formState.badge_image;
				this.existingBadgeClass.imageFrame = imageFrame;
				this.existingBadgeClass.criteria_text = formState.badge_criteria_text;
				this.existingBadgeClass.criteria_url = formState.badge_criteria_url;
				this.existingBadgeClass.alignments = this.alignmentsEnabled ? formState.alignments : [];
				this.existingBadgeClass.tags = Array.from(this.tags);
				this.existingBadgeClass.extension = {
					...this.existingBadgeClass.extension,
					'extensions:StudyLoadExtension': {
						'@context': studyLoadExtensionContextUrl,
						type: ['Extension', 'extensions:StudyLoadExtension'],
						StudyLoad: Number(formState.badge_study_load),
					},
					'extensions:CategoryExtension': {
						'@context': categoryExtensionContextUrl,
						type: ['Extension', 'extensions:CategoryExtension'],
						Category: String(formState.badge_category),
					},
					'extensions:LevelExtension': {
						'@context': levelExtensionContextUrl,
						type: ['Extension', 'extensions:LevelExtension'],
						Level: String(formState.badge_level),
					},
					'extensions:CompetencyExtension': this.getCompetencyExtensions(
						suggestions,
						formState,
						competencyExtensionContextUrl,
					),
				};
				if (this.currentImage) {
					this.existingBadgeClass.extension = {
						...this.existingBadgeClass.extension,
						'extensions:OrgImageExtension': {
							'@context': orgImageExtensionContextUrl,
							type: ['Extension', 'extensions:OrgImageExtension'],
							OrgImage: this.currentImage,
						},
					};
				}
				if (this.expirationEnabled) {
					this.existingBadgeClass.expiresDuration =
						expirationState.expires_duration as BadgeClassExpiresDuration;
					this.existingBadgeClass.expiresAmount = parseInt(expirationState.expires_amount, 10);
				} else {
					this.existingBadgeClass.clearExpires();
				}

				this.savePromise = this.existingBadgeClass.save();
			} else {
				let badgeClassData = {
					name: formState.badge_name,
					description: formState.badge_description,
					image: formState.badge_image,
					imageFrame: imageFrame,
					criteria_text: formState.badge_criteria_text,
					criteria_url: formState.badge_criteria_url,
					tags: Array.from(this.tags),
					alignment: this.alignmentsEnabled ? formState.alignments : [],
					extensions: {
						'extensions:StudyLoadExtension': {
							'@context': studyLoadExtensionContextUrl,
							type: ['Extension', 'extensions:StudyLoadExtension'],
							StudyLoad: Number(formState.badge_study_load),
						},
						'extensions:CategoryExtension': {
							'@context': categoryExtensionContextUrl,
							type: ['Extension', 'extensions:CategoryExtension'],
							Category: String(formState.badge_category),
						},
						'extensions:LevelExtension': {
							'@context': levelExtensionContextUrl,
							type: ['Extension', 'extensions:LevelExtension'],
							Level: String(formState.badge_level),
						},
						'extensions:BasedOnExtension': {
							'@context': basedOnExtensionContextUrl,
							type: ['Extension', 'extensions:BasedOnExtension'],
							BasedOn: formState.badge_based_on,
						},
						'extensions:CompetencyExtension': this.getCompetencyExtensions(
							suggestions,
							formState,
							competencyExtensionContextUrl,
						),
					},
				} as ApiBadgeClassForCreation;
				if (this.currentImage) {
					badgeClassData.extensions = {
						...badgeClassData.extensions,
						'extensions:OrgImageExtension': {
							'@context': orgImageExtensionContextUrl,
							type: ['Extension', 'extensions:OrgImageExtension'],
							OrgImage: this.currentImage,
						},
					};
				}
				if (this.expirationEnabled) {
					badgeClassData.expires = {
						duration: expirationState.expires_duration as BadgeClassExpiresDuration,
						amount: parseInt(expirationState.expires_amount, 10),
					};
				}

				this.savePromise = this.badgeClassManager.createBadgeClass(this.issuerSlug, badgeClassData);
			}

			this.save.emit(this.savePromise);
		} catch (e) {
			console.log(e);
		}
	}

	/**
	 * Gets the combinded competency extensions, based on the "by hand" competencies (@see formState.competencies)
	 * and the ones that were suggested by the ai tool and selected (@see formState.aiCompetencies).
	 */
	getCompetencyExtensions(
		suggestions: Skill[],
		formState,
		competencyExtensionContextUrl: string,
	): {
		'@context': string;
		type: string[];
		name: string;
		description: string;
		escoId: string;
		studyLoad: number;
		category: string;
	} {
		return formState.competencies
			.map((competency) => ({
				'@context': competencyExtensionContextUrl,
				type: ['Extension', 'extensions:CompetencyExtension'],
				name: String(competency.name),
				description: String(competency.description),
				escoID: String(competency.escoID),
				studyLoad: Number(competency.studyLoad),
				category: String(competency.category),
			}))
			.concat(
				formState.aiCompetencies
					.map((aiCompetency, index) => ({
						'@context': competencyExtensionContextUrl,
						type: ['Extension', 'extensions:CompetencyExtension'],
						name: suggestions[index].preferred_label,
						description: suggestions[index].description,
						escoID: suggestions[index].concept_uri,
						studyLoad: Number(aiCompetency.studyLoad),
						category: suggestions[index].type.includes('skill') ? 'skill' : 'knowledge',
					}))
					.filter((_, index) => formState.aiCompetencies[index].selected),
			);
	}

	cancelClicked() {
		this.cancel.emit();
	}

	generateRandomImage() {
		this.badgeStudio
			.generateRandom()
			.then((imageUrl) => this.imageField.useDataUrl(imageUrl, 'Auto-generated image'));
	}

	generateUploadImage(image, formdata) {
		// the imageUploaded-event of the angular image component is also called after initialising the component because the image is set in initFormFromExisting
		if (typeof this.currentImage == 'undefined' || this.initedCurrentImage) {
			this.initedCurrentImage = true;
			this.currentImage = image.slice();
			this.badgeStudio.generateUploadImage(image.slice(), formdata).then((imageUrl) => {
				this.imageField.useDataUrl(imageUrl, 'BADGE');
				// Added as a workaround to resolve the issue of not showing badge frame from first time (only with safari browser)
				this.adjustUploadImage(formdata);
			});
		} else {
			this.initedCurrentImage = true;
		}
	}

	generateCustomUploadImage(image) {
		// the imageUploaded-event of the angular image component is also called after initialising the component because the image is set in initFormFromExisting
		if (typeof this.currentImage == 'undefined' || this.initedCurrentImage) {
			this.initedCurrentImage = true;
			this.currentImage = image.slice();
			// do not use frame for custom images
			this.customImageField.useDataUrl(this.currentImage, 'BADGE');
		} else {
			this.initedCurrentImage = true;
		}
	}

	adjustUploadImage(formdata) {
		if (this.currentImage && this.badgeStudio) {
			this.badgeStudio
				.generateUploadImage(this.currentImage.slice(), formdata)
				.then((imageUrl) => this.imageField.useDataUrl(imageUrl, 'BADGE'));
		}
	}

	allowedFileFormats = ['image/png', 'image/svg+xml'];
	allowedFileFormatsCustom = ['image/png'];

	positiveInteger(control: AbstractControl) {
		const val = parseInt(control.value, 10);
		if (isNaN(val) || val < 1) {
			return { expires_amount: 'Must be a positive integer' };
		}
	}

	positiveIntegerOrNull(control: AbstractControl) {
		const val = parseFloat(control.value);

		if (isNaN(val)) {
			return { duration: 'Field cannot be empty, set to 0 if not needed' };
		}
		if (!Number.isInteger(val) || val < 0) {
			return { duration: 'Must be a positive integer or null' };
		}
	}

    noDuplicateCompetencies(): {duplicateCompetency: Boolean} | null {
        if (this.duplicateCompetency)
            return { duplicateCompetency: true };
    }

    get duplicateCompetency(): String | null {
        if (!this.badgeClassForm) return null;

        const hand = this.badgeClassForm.controls.competencies.value.
            // Hand competencies get added automatically at submitting
            //filter(c => c.added).
            map(c => c.name);
		
		const ai = this.badgeClassForm.controls.aiCompetencies.value
			.map((c, i) => (c.selected ? this.aiCompetenciesSuggestions[i].preferred_label : ''))
			.filter(String);

        const all = hand.concat(ai);
        const check = new Set();

        for (const name of all)
            if (check.has(name))
                return name;
            else
                check.add(name);
        return null;
    }

	closeLegend() {
		this.showLegend = false;
	}

	openLegend() {
		this.showLegend = true;
	}
}
