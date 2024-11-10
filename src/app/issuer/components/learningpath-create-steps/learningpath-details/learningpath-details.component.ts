import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
import { BgFormFieldImageComponent } from '../../../../common/components/formfield-image';
import { base64ByteSize } from '../../../../common/util/file-util';
import { BadgeStudioComponent } from '../../badge-studio/badge-studio.component';
import { StepperComponent } from '../../../../components/stepper/stepper.component';


@Component({
  selector: 'learningpath-details',
  templateUrl: './learningpath-details.component.html',
  styleUrls: ['../../learningpath-edit-form/learningpath-edit-form.component.scss']
})

export class LearningPathDetailsComponent implements OnInit, AfterViewInit {
	
	@ViewChild(StepperComponent) stepper: StepperComponent;
	
	@ViewChild('badgeStudio')
	badgeStudio: BadgeStudioComponent;

  	@ViewChild('imageField')
	imageField: BgFormFieldImageComponent;

	@ViewChild('customImageField')
	customImageField: BgFormFieldImageComponent;

	readonly badgeClassPlaceholderImageUrl = '../../../../breakdown/static/images/placeholderavatar.svg';

  	allowedFileFormats = ['image/png', 'image/svg+xml'];
	allowedFileFormatsCustom = ['image/png'];

  constructor(
	private translate: TranslateService,
	private rootFormGroup: FormGroupDirective
	) {
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

	useOurEditor: string 
	imageSublabel: string
	useOwnVisual: string
  	uploadOwnVisual: string 
	uploadOwnDesign: string
	chooseFromExistingIcons: string
	selectFromMyFiles: string


  get imageFieldDirty() {
		return this.lpDetailsForm.controls.badge_image.dirty || this.lpDetailsForm.controls.badge_customImage.dirty;
	}


  lpDetailsForm = typedFormGroup(this.imageValidation.bind(this))
		.addControl('name', '', [Validators.required, Validators.maxLength(60)])
		.addControl('description', '', [Validators.required, Validators.maxLength(700)])
		.addControl('badge_image', '')
		.addControl('badge_customImage', '');

  ngOnInit(): void {
	this.detailsForm = this.rootFormGroup.control
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
	})
	this.translate.get('RecBadge.chooseFromExistingIcons').subscribe((res: string) => {
		this.chooseFromExistingIcons = res;
	})
	this.translate.get('RecBadge.selectFromMyFiles').subscribe((res: string) => {
		this.selectFromMyFiles = res;
	})

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

	generateUploadImage(image, formdata) {
		this.badgeStudio.generateUploadImage(image.slice(), formdata).then((imageUrl) => {
			this.imageField.useDataUrl(imageUrl, 'BADGE');
		});
	}

	generateCustomUploadImage(image) {
		if (base64ByteSize(image) > this.maxCustomImageSize) {
			this.isCustomImageLarge = true;
			return;
		}
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
