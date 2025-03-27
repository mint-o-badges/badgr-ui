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
import { BadgeClassApiService } from '../../services/badgeclass-api.service';
import { UrlValidator } from '../../../common/validators/url.validator';
import { Issuer } from '../../models/issuer.model';
import { IssuerManager } from '../../services/issuer-manager.service';

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
	standalone: false,
})
export class LearningPathEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	@ViewChild(StepperComponent) stepper: StepperComponent;

	@ViewChild('stepOne') stepOne!: LearningPathDetailsComponent;
	@ViewChild('stepTwo') stepTwo!: LearningPathBadgesComponent;
	@ViewChild('stepThree') stepThree!: LearningPathBadgeOrderComponent;
	@ViewChild('stepFour') stepFour!: LearningPathTagsComponent;

	nextStep(): void {
		// this.learningPathForm.markTreeDirtyAndValidate();
		this.stepper.next();
	}

	previousStep(): void {
		this.stepper.previous();
	}

	badgeCardChecked = false;

	onCheckedChange(event) {
		console.log(event);
	}

	@Output()
	save = new EventEmitter<Promise<ApiLearningPath>>();

	@Output()
	cancel = new EventEmitter<void>();

	@Input()
	submittingText: string;

	@Input()
	set learningPath(lp: LearningPath) {
		this.existingLearningPath = {
			badges: lp.badges,
			issuer_id: lp.issuer_id,
			issuer_name: lp.issuer_name,
			participationBadge_id: lp.participationBadgeId,
			name: lp.name,
			tags: lp.tags,
			description: lp.description,
			participationBadge_image: lp.participationBadgeImage,
			slug: lp.slug,
		};
	}

	existingLpBadge: BadgeClass | null = null;

	@Input()
	set lpBadge(badge: BadgeClass) {
		if (this.existingLpBadge !== badge) {
			this.existingLpBadge = badge;
		}
	}

	existingLearningPath: ApiLearningPath | null = null;

	breadcrumbLinkEntries: LinkEntry[] = [];
	step3Loaded = false;
	selectedBadgeUrls: string[] = [];
	selectedBadges: any[] = [];
	studyLoad: number = 0;
	savePromise: Promise<ApiLearningPath> | Promise<void> | null = null;
	selectedStep = 0;

	detailsForm: any;
	lpName: string;
	lpDescription: string;
	lpImage: string;

	lpTags: string[];
	badgeList: any[] = [];

	baseUrl: string;

	issuer: Issuer;
	issuerLoaded: Promise<unknown>;

	constructor(
		protected formBuilder: FormBuilder,
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
	) // protected title: Title,
	{
		super(router, route, loginService);
		this.baseUrl = this.configService.apiConfig.baseUrl;
		// this.selectedBadgesLoaded = this.loadSelectedBadges();
		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
		});
	}
	next: string;
	previous: string;

	ngOnInit() {
		this.translate.get('General.next').subscribe((next) => {
			this.next = next;
		});
		this.translate.get('General.previous').subscribe((previous) => {
			this.previous = previous;
		});
		this.learningPathForm.setValue({
			license: [
				{
					id: 'CC-0',
					name: 'Public Domain',
					legalCode: 'https://creativecommons.org/publicdomain/zero/1.0/legalcode',
				},
			],
		});
		if (this.existingLearningPath) {
			this.updateBadgeList(
				this.existingLearningPath.badges.map((badge) => {
					return {
						id: badge.badge.slug,
						name: badge.badge.name,
						image: badge.badge.image,
						description: badge.badge.description,
						slug: badge.badge.slug,
						issuerName: badge.badge.issuerName,
					};
				}),
			);
		}
	}

	// updateSelectedBadges({ urls, studyLoad }: { urls: string[], studyLoad: number }) {
	// 	this.selectedBadgeUrls = urls;
	// 	this.studyLoad = studyLoad;
	// }

	updateSelectedBadges({ badges, studyLoad }: { badges: BadgeClass[]; studyLoad: number }) {
		this.selectedBadges = badges;
		this.studyLoad = studyLoad;

		const badgeList = this.selectedBadges.map((badge, index) => ({
			id: badge.slug,
			name: badge.name,
			image: badge.image,
			description: badge.description,
			slug: badge.slug,
			issuerName: badge.issuerName,
			order: index,
		}));

		this.updateBadgeList(badgeList);
	}

	// updateSelectedBadges({ badges, studyLoad }: { badges: BadgeClass[], studyLoad: number }) {
	// 	this.selectedBadges = badges;
	// 	this.studyLoad = studyLoad;
	// 	const badgeList = this.selectedBadges.reverse().map((badge) => {
	// 		return {
	// 			id: badge.slug,
	// 			name: badge.name,
	// 			image: badge.image,
	// 			description: badge.description,
	// 			slug: badge.slug,
	// 			issuerName: badge.issuerName,
	// 		};
	// 	})
	// 	this.updateBadgeList(badgeList)
	// }

	updateTags(tags: string[]) {
		this.lpTags = tags;
	}

	updateBadgeList(badges: any[]) {
		this.badgeList = badges;
		this.selectedBadges = badges.map((badge) => ({
			slug: badge.id,
			name: badge.name,
			image: badge.image,
			description: badge.description,
			issuerName: badge.issuerName,
		}));
	}

	learningPathForm = typedFormGroup().addArray(
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
			if (this.stepOne.lpDetailsForm.rawControl.value.badge_customImage) {
				this.lpImage = this.stepOne.lpDetailsForm.rawControl.value.badge_customImage;
			}
			this.selectedStep = event.selectedIndex;
			if (this.selectedStep === 3) {
				this.step3Loaded = true;
			} else {
				this.step3Loaded = false;
			}
		});

		this.learningPathForm.add('details', this.stepOne.lpDetailsForm);
		// .add('badges', this.stepThree.);
	}

	onStepChange(event: any): void {
		// this.learningPathForm.markTreeDirtyAndValidate();
	}

	getErrorMessage() {
		if (this.stepOne.lpDetailsForm.hasError) {
			return this.stepOne.lpDetailsForm.errors.first();
		}
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

	async onSubmit() {
		const studyLoadExtensionContextUrl = `${this.baseUrl}/static/extensions/StudyLoadExtension/context.json`;
		const categoryExtensionContextUrl = `${this.baseUrl}/static/extensions/CategoryExtension/context.json`;
		const licenseExtensionContextUrl = `${this.baseUrl}/static/extensions/LicenseExtension/context.json`;
		const competencyExtensionContextUrl = `${this.baseUrl}/static/extensions/CompetencyExtension/context.json`;

		const criteriaText =
			'*Folgende Kriterien sind auf Basis deiner Eingaben als Metadaten im Badge hinterlegt*: \n\n';
		const participationText = `Du hast erfolgreich an **${this.stepOne.lpDetailsForm.controls.name.value}** teilgenommen.  \n\n `;

		if (this.existingLearningPath && this.existingLpBadge) {
			const data = {
				name: this.stepOne.lpDetailsForm.controls.name.value,
				description: this.stepOne.lpDetailsForm.controls.description.value,
				image: this.stepOne.lpDetailsForm.controls.badge_image.value,
				tags: Array.from(this.lpTags),
			};
			this.existingLpBadge.imageFrame =
				this.stepOne.lpDetailsForm.controls.badge_customImage.value && this.stepOne.lpDetailsForm.valid
					? false
					: true;
			this.existingLpBadge.image = this.stepOne.lpDetailsForm.controls.badge_image.value;
			(this.existingLpBadge.name = this.stepOne.lpDetailsForm.controls.name.value),
				(this.existingLpBadge.description = this.stepOne.lpDetailsForm.controls.description.value),
				(this.existingLpBadge.tags = this.lpTags),
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

			this.savePromise = this.learningPathApiService.updateLearningPath(
				this.issuerSlug,
				this.existingLearningPath.slug,
				{
					...this.existingLearningPath,
					name: data.name,
					description: data.description,
					participationBadge_id: this.existingLearningPath.participationBadge_id,
					participationBadge_image: data.image,
					tags: data.tags,
					badges: this.badgeList.map((item, index) => {
						return {
							slug: item.slug,
							order: item.order,
						};
					}),
				},
			);

			this.save.emit(this.savePromise);

			// clear sessionStorage
			sessionStorage.removeItem('oeb-create-badgeclassvalues');
		} else {
			this.savePromise = (async () => {
				try {
					let imageFrame = true;
					if (
						this.stepOne.lpDetailsForm.controls.badge_customImage.value &&
						this.stepOne.lpDetailsForm.valid
					) {
						imageFrame = false;
						this.stepOne.lpDetailsForm.controls.badge_image.setValue(
							this.stepOne.lpDetailsForm.controls.badge_customImage.value,
						);
					}

					const participationBadge = await this.badgeClassService.createBadgeClass(this.issuerSlug, {
						image: this.stepOne.lpDetailsForm.controls.badge_image.value,
						imageFrame: imageFrame,
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
					// clear sessionStorage
					sessionStorage.removeItem('oeb-create-badgeclassvalues');
				} catch (e) {
					this.savePromise = null;
					console.log(e);
				}
			})();
		}
	}
}
