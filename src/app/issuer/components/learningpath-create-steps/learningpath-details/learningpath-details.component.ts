import { AfterViewInit, Component, OnInit, ViewChild, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
import { BgFormFieldImageComponent } from '../../../../common/components/formfield-image';
import { base64ByteSize } from '../../../../common/util/file-util';
import { BadgeStudioComponent } from '../../badge-studio/badge-studio.component';
import { StepperComponent } from '../../../../components/stepper/stepper.component';
import { ApiLearningPath } from '../../../../common/model/learningpath-api.model';
import { BadgeClass } from '../../../../issuer/models/badgeclass.model';
import { LearningPath } from '../../../../issuer/models/learningpath.model';
import { Issuer } from '../../../../issuer/models/issuer.model';

interface LearningPathBadgeInput {
	learningPath: ApiLearningPath;
	lpBadge: BadgeClass;
}

@Component({
	selector: 'learningpath-details',
	templateUrl: './learningpath-details.component.html',
	styleUrls: ['../../learningpath-edit-form/learningpath-edit-form.component.scss'],
	standalone: false,
})
export class LearningPathDetailsComponent implements OnInit, AfterViewInit {
	@ViewChild(StepperComponent) stepper: StepperComponent;

	@ViewChild('badgeStudio')
	badgeStudio: BadgeStudioComponent;

	@ViewChild('imageField')
	imageField: BgFormFieldImageComponent;

	@ViewChild('customImageField')
	customImageField: BgFormFieldImageComponent;

	@Input() learningPathBadgeData: LearningPathBadgeInput;

	@Input() issuer: Issuer;

	existingLearningPath: LearningPath | null = null;

	existingLpBadge: BadgeClass | null = null;

	currentImage;

	readonly badgeClassPlaceholderImageUrl = '../../../../breakdown/static/images/placeholderavatar.svg';

	allowedFileFormats = ['image/png', 'image/svg+xml'];
	allowedFileFormatsCustom = ['image/png'];

	constructor(
		private translate: TranslateService,
		private rootFormGroup: FormGroupDirective,
	) {}

	initFormFromExisting(lp: ApiLearningPath, badge: BadgeClass) {
		if (!lp || !badge) return;

		this.lpDetailsForm.setValue({
			name: lp.name,
			description: lp.description,
			badge_category: 'learningpath',
			badge_image: badge.imageFrame ? lp.participationBadge_image : null,
			badge_customImage: !badge.imageFrame ? lp.participationBadge_image : null,
			useIssuerImageInBadge: true,
		});
	}

	isCustomImageLarge = false;
	maxCustomImageSize = 1024 * 250;

	detailsForm: FormGroup;

	// useOurEditor = this.translate.instant('CreateBadge.useOurEditor');
	// imageSublabel = this.translate.instant('CreateBadge.imageSublabel');
	// useOwnVisual = this.translate.instant('CreateBadge.useOwnVisual');
	// uploadOwnVisual = this.translate.instant('CreateBadge.uploadOwnVisual');
	// uploadOwnDesign = this.translate.instant('CreateBadge.uploadOwnDesign');
	// chooseFromExistingIcons = this.translate.instant('RecBadge.chooseFromExistingIcons');
	// selectFromMyFiles = this.translate.instant('RecBadge.selectFromMyFiles');

	useOurEditor: string;
	imageSublabel: string;
	useOwnVisual: string;
	uploadOwnVisual: string;
	uploadOwnDesign: string;
	chooseFromExistingIcons: string;
	selectFromMyFiles: string;

	get imageFieldDirty() {
		return this.lpDetailsForm.controls.badge_image.dirty || this.lpDetailsForm.controls.badge_customImage.dirty;
	}

	lpDetailsForm = typedFormGroup(this.imageValidation.bind(this))
		.addControl('name', '', [Validators.required, Validators.maxLength(60)])
		.addControl('description', '', [Validators.required, Validators.maxLength(700)])
		.addControl('badge_image', '')
		.addControl('badge_category', 'learningpath')
		.addControl('badge_customImage', '')
		.addControl('useIssuerImageInBadge', true);

	ngOnInit(): void {
		this.initFormFromExisting(this.learningPathBadgeData.learningPath, this.learningPathBadgeData.lpBadge);

		if (!this.existingLearningPath) {
			// restore name and description from sessionStorage
			const sessionValuesJSON = sessionStorage.getItem('oeb-create-badgeclassvalues');
			if (sessionValuesJSON) {
				const sessionValues = JSON.parse(sessionValuesJSON);
				this.lpDetailsForm.rawControl.patchValue({
					name: sessionValues['badge_name'] || '',
					description: sessionValues['badge_description'] || '',
				});
			}
			// save name and description to sessionStorage on Change
			this.lpDetailsForm.rawControl.valueChanges.subscribe((v) => {
				let saveableSessionValues = {};
				for (const [k, v] of Object.entries(this.lpDetailsForm.rawControl.value)) {
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

		this.detailsForm = this.rootFormGroup.control;
		this.translate.get('CreateBadge.useOurEditor').subscribe((res: string) => {
			this.useOurEditor = res;
		});
		this.translate.get('CreateBadge.imageSublabel').subscribe((res: string) => {
			this.imageSublabel = res;
		});
		this.translate.get('CreateBadge.useOwnVisual').subscribe((res: string) => {
			this.useOwnVisual = res;
		});
		this.translate.get('CreateBadge.uploadOwnVisual').subscribe((res: string) => {
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
	}

	ngAfterViewInit(): void {
		this.lpDetailsForm.controls.badge_image.rawControl.valueChanges.subscribe((value) => {
			if (this.imageField.control.value != null) this.customImageField.control.reset();
		});

		this.lpDetailsForm.controls.badge_customImage.rawControl.valueChanges.subscribe((value) => {
			if (this.customImageField.control.value != null) this.imageField.control.reset();
		});
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

	imageValidation(): ValidationErrors | null {
		if (!this.lpDetailsForm) return null;

		const value = this.lpDetailsForm.value;

		const image = (value.badge_image || '').trim();
		const customImage = (value.badge_customImage || '').trim();
		// To hide custom-image large size error msg
		this.isCustomImageLarge = false;

		if (!image.length && !customImage.length) {
			return { imageRequired: true };
		}
	}
}
