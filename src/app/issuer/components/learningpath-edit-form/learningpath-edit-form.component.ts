import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { FormArray, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerApiService } from '../../services/issuer-api.service';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { sortUnique } from '../../../catalog/components/badge-catalog/badge-catalog.component';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import {
	DndDraggableDirective,
	DndDropEvent,
	DndDropzoneDirective,
	DndHandleDirective,
	DndPlaceholderRefDirective,
	DropEffect,
	EffectAllowed,
	DndModule,
} from 'ngx-drag-drop';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { LearningPath } from '../../models/learningpath.model';
import { BadgeStudioComponent } from '../badge-studio/badge-studio.component';
import { BgFormFieldImageComponent } from '../../../common/components/formfield-image';
import { TranslateService } from '@ngx-translate/core';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { ApiLearningPath, ApiLearningPathForCreation } from '../../../common/model/learningpath-api.model';
import { BadgeClassCategory } from '../../models/badgeclass-api.model';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { LearningPathManager } from '../../services/learningpath-manager.service';
import { StepperComponent } from '../../../components/stepper/stepper.component';
import { base64ByteSize } from '../../../common/util/file-util';
import { LearningPathDetailsComponent } from '../learningpath-create-steps/learningpath-details/learningpath-details.component';
import { LearningPathBadgesComponent } from '../learningpath-create-steps/learningpath-badges/learningpath-badges.component';
import { LearningPathBadgeOrderComponent } from '../learningpath-create-steps/learningpath-badge-order/learningpath-badge-order.component';
import { LearningPathTagsComponent } from '../learningpath-create-steps/learningpath-tags/learningpath-tags.component';
import { AppConfigService } from '../../../common/app-config.service';

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
})
export class LearningPathEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	@ViewChild(StepperComponent) stepper: StepperComponent;

	@ViewChild('stepOne') stepOne!: LearningPathDetailsComponent;
	@ViewChild('stepTwo') stepTwo!: LearningPathBadgesComponent;
	@ViewChild('stepThree') stepThree!: LearningPathBadgeOrderComponent;
	@ViewChild('stepFour') stepFour!: LearningPathTagsComponent;

	nextStep(): void {
		this.learningPathForm.markTreeDirtyAndValidate();
		this.stepper.next();
	}

	previousStep(): void {
		this.stepper.previous();
	}

	badgeCardChecked = false;

	onCheckedChange(event) {
		console.log(event)
	}

	@Output()
	save = new EventEmitter<Promise<ApiLearningPath>>();

	@Input()
	submittingText: string;

	existingLearningPath: LearningPath | null = null;

	breadcrumbLinkEntries: LinkEntry[] = [];
	step3Loaded = false;
	selectedBadgeUrls: string[] = [];
	selectedBadges: BadgeClass[] = [];
	studyLoad: number = 0;
	savePromise: Promise<ApiLearningPath> | null = null;
	selectedStep = 0;

	detailsForm: any;
	lpName: string;
	lpDescription: string;
	lpImage: string;

	lpTags: string[];
	badgeList: any[] = [];

	baseUrl: string

	constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected learningPathApiService: LearningPathApiService,
		protected issuerApiService: IssuerApiService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected badgeClassService: BadgeClassManager,
		private translate: TranslateService,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected learningPathManager: LearningPathManager,
		protected configService: AppConfigService,

		// protected title: Title,
	) {
		super(router, route, loginService);
		this.baseUrl = this.configService.apiConfig.baseUrl;
		// this.selectedBadgesLoaded = this.loadSelectedBadges();
	}
	next: string
	previous: string;


	ngOnInit() {
		this.translate.get('General.next').subscribe((next) => {
			this.next = next;
		});
		this.translate.get('General.previous').subscribe((previous) => {
			this.previous = previous;
		});
	}

	updateSelectedBadges({ urls, studyLoad }: { urls: string[], studyLoad: number }) {
		this.selectedBadgeUrls = urls;
		this.studyLoad = studyLoad;
	}

	updateTags(tags: string[]) {
		this.lpTags = tags;
	}

	updateBadgeList(badges: any[]) {
		this.badgeList = badges;
	}

	learningPathForm = typedFormGroup();


	ngAfterViewInit() {
		this.stepper.selectionChange.subscribe((event) => {
			if (this.stepOne.lpDetailsForm.rawControl.value.name) {
				this.lpName = this.stepOne.lpDetailsForm.rawControl.value.name;
			}
			if (this.stepOne.lpDetailsForm.rawControl.value.description) {
				this.lpDescription = this.stepOne.lpDetailsForm.rawControl.value.description;
			}
			if (this.stepOne.lpDetailsForm.rawControl.value.badge_image) {
				this.lpImage = this.stepOne.lpDetailsForm.rawControl.value.badge_image;
			}
			this.selectedStep = event.selectedIndex;
			if (this.selectedStep === 2) {
				this.step3Loaded = true;
			} else {
				this.step3Loaded = false;
			}
		})
		this.learningPathForm
			.add('details', this.stepOne.lpDetailsForm)
		// .add('badges', this.stepThree.);

	}

	onStepChange(event: any): void {
		this.learningPathForm.markTreeDirtyAndValidate();
	}

	getErrorMessage() {
		if (this.stepOne.lpDetailsForm.hasError) {
			return this.stepOne.lpDetailsForm.errors.first();
		}
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}


	cancelClicked() {
		// this.cancel.emit();
	}

	async onSubmit() {
		try {
			const formState = this.learningPathForm.value;

			let imageFrame = true;
			if (this.stepOne.lpDetailsForm.controls.badge_customImage.value && this.stepOne.lpDetailsForm.valid) {
				imageFrame = false;
				this.stepOne.lpDetailsForm.controls.badge_image.setValue(this.stepOne.lpDetailsForm.controls.badge_customImage.value);
			}

			const criteriaText =
				'*Folgende Kriterien sind auf Basis deiner Eingaben als Metadaten im Badge hinterlegt*: \n\n';
			const participationText = `Du hast erfolgreich an **${this.stepOne.lpDetailsForm.controls.name.value}** teilgenommen.  \n\n `;

			const studyLoadExtensionContextUrl = `${this.baseUrl}/static/extensions/StudyLoadExtension/context.json`;
			const categoryExtensionContextUrl = `${this.baseUrl}/static/extensions/CategoryExtension/context.json`;

			const participationBadge = await this.badgeClassService.createBadgeClass(this.issuerSlug, {
				image: this.stepOne.lpDetailsForm.controls.badge_image.value,
				name: this.stepOne.lpDetailsForm.controls.name.value,
				description: this.stepOne.lpDetailsForm.controls.description.value,
				tags: this.lpTags,
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
						Category: 'participation',
					},
					// 'extensions:LevelExtension': {
					// 	'@context': levelExtensionContextUrl,
					// 	type: ['Extension', 'extensions:LevelExtension'],
					// 	Level: String(formState.badge_level),
					// },
					// 'extensions:BasedOnExtension': {
					// 	'@context': basedOnExtensionContextUrl,
					// 	type: ['Extension', 'extensions:BasedOnExtension'],
					// 	BasedOn: formState.badge_based_on,
					// },
					// 'extensions:CompetencyExtension': this.getCompetencyExtensions(
					// 	suggestions,
					// 	formState,
					// 	competencyExtensionContextUrl,
					// ),
				},
			});

			const issuer = await this.issuerApiService.getIssuer(this.issuerSlug);

			this.savePromise = this.learningPathApiService.createLearningPath(this.issuerSlug, {
				issuer_id: issuer.slug,
				name: this.stepOne.lpDetailsForm.controls.name.value,
				description: this.stepOne.lpDetailsForm.controls.description.value,
				tags: this.lpTags,
				badges: this.badgeList.map((item, index) => {
					return {
						slug: item.slug,
						order: index,
					};
				}),
				participationBadge_id: participationBadge.slug,
			});

			this.save.emit(this.savePromise);
		} catch (e) {
			console.log(e);
		}
	}
}
