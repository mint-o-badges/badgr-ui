import { Component, OnInit, Input, input, ElementRef, viewChild, TemplateRef } from '@angular/core';
import { TypedFormGroup, typedFormGroup } from '../../../common/util/typed-forms';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { IssuerNameValidator } from '../../../common/validators/issuer-name.validator';
import { UrlValidator } from '../../../common/validators/url.validator';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { ApiIssuerForCreation, ApiIssuerForEditing } from '../../models/issuer-api.model';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppConfigService } from '../../../common/app-config.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { IssuerManager } from '../../services/issuer-manager.service';
import { preloadImageURL } from '../../../common/util/file-util';
import { Issuer } from '../../models/issuer.model';
import { BgFormFieldImageComponent } from '../../../common/components/formfield-image';
import { OebInputComponent } from '../../../components/input.component';
import { OebSelectComponent } from '../../../components/select.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmP, HlmH3 } from '@spartan-ng/helm/typography';
import { NetworkManager } from '~/issuer/services/network-manager.service';
import { countries } from 'countries-list';
import * as states from '../../../../assets/data/german-states.json';
import type { TCountries, ICountry, ICountryData } from 'countries-list';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { DialogComponent } from '~/components/dialog.component';

@Component({
	selector: 'issuer-edit-form',
	templateUrl: 'issuer-edit-form.component.html',
	styleUrls: ['issuer-edit-form.component.scss'],
	imports: [
		FormsModule,
		BgFormFieldImageComponent,
		OebInputComponent,
		OebSelectComponent,
		OebCheckboxComponent,
		ReactiveFormsModule,
		OebButtonComponent,
		RouterLink,
		TranslatePipe,
		HlmP,
		HlmH3,
	],
})
export class IssuerEditFormComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	issuerForm: any;

	emails: UserProfileEmail[];
	primaryEmail: UserProfileEmail;
	emailsOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<unknown>;
	editIssuerFinished: Promise<unknown>;

	addNetworkFinished: Promise<unknown>;

	_countriesOptions: FormFieldSelectOption[];
	_germanStateOptions: FormFieldSelectOption[];

	emailsLoaded: Promise<unknown>;

	enterDescription: string;
	issuerRequiredError: string;
	invalidCharacterError: string = '';
	selectFromMyFiles: string;
	useImageFormat: string;
	imageError: string;

	herebyIConfirm: string;
	iAmEligible: string;
	iAmResponsible: string;
	noMisuse: string;

	existingIssuer: Issuer | null = null;

	networkForm = input<boolean>(false);

	@Input() issuerSlug: string;

	@Input() set issuer(issuer: Issuer) {
		if (this.existingIssuer !== issuer) {
			this.existingIssuer = issuer;
			this.initFormFromExisting(issuer);
		}
	}

	imageField = viewChild.required<ElementRef<HTMLElement>>('imageField');

	linkedInIdHeaderTemplate = viewChild.required<TemplateRef<any>>('linkedInIdDialogHeader');
	linkedInIdBodyTemplate = viewChild.required<TemplateRef<any>>('linkedInIdDialogBody');

	constructor(
		loginService: SessionService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected configService: AppConfigService,
		protected profileManager: UserProfileManager,
		protected queryParams: QueryParametersService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected translate: TranslateService,
		protected issuerManager: IssuerManager,
		protected networkManager: NetworkManager,
		protected dialogService: HlmDialogService,
	) {
		title.setTitle(`Create Issuer - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		if (this.configService.theme.dataProcessorTermsLink) {
			this.issuerForm.addControl('agreedTerms', '', Validators.requiredTrue);
		}

		const authCode = this.queryParams.queryStringValue('authCode', true);
		if (loginService.isLoggedIn && !authCode) this.refreshProfile();

		this.emailsLoaded = this.profileManager.userProfilePromise
			.then((profile) => profile.emails.loadedPromise)
			.then((emails) => {
				this.emails = emails.entities.filter((e) => e.verified);
				this.primaryEmail = emails.entities.find((e) => e.primary);
				this.emailsOptions = this.emails.map((e) => {
					return {
						label: e.email,
						value: e.email,
					};
				});
			});

		this._countriesOptions = Object.values(countries).map((r) => ({
			label: r.native,
			value: r.name,
		}));

		this._germanStateOptions = Object.values(states).map((r) => ({
			label: r.de,
			value: r.iso,
		}));
	}

	ngOnInit() {
		this.buildForm();

		this.translate.get('Issuer.enterDescription').subscribe((translatedText: string) => {
			this.enterDescription = translatedText;
		});
		this.translate.get('Issuer.enterName').subscribe((translatedText: string) => {
			this.issuerRequiredError = translatedText;
		});
		this.translate.get('RecBadge.selectFromMyFiles').subscribe((translatedText: string) => {
			this.selectFromMyFiles = translatedText;
		});
		this.translate.get('Issuer.useImageFormat').subscribe((translatedText: string) => {
			this.useImageFormat = translatedText;
		});

		this.translate.get('Issuer.herebyIConfirm').subscribe((translatedText: string) => {
			this.herebyIConfirm = translatedText;
		});

		this.translate.get('Issuer.responsible').subscribe((translatedText: string) => {
			this.iAmResponsible = translatedText;
		});

		this.translate.get('Issuer.noMisuse').subscribe((translatedText: string) => {
			this.noMisuse = translatedText;
		});
	}

	private buildForm() {
		this.issuerForm = typedFormGroup()
			.addControl('issuer_name', '', [
				Validators.required,
				Validators.maxLength(90),
				IssuerNameValidator.validIssuerName,
			])
			.addControl('issuer_description', '', [
				Validators.required,
				Validators.minLength(200),
				Validators.maxLength(300),
			])
			.addControl('issuer_url', '', [Validators.required, UrlValidator.validUrl])
			.addControl('issuer_image', '', Validators.required)
			.addControl('country', 'Germany', Validators.required)
			.addControl('state', '')
			.addControl('issuer_linkedin_id', '');

		if (!this.networkForm()) {
			this.issuerForm
				.addControl('issuer_email', '', [Validators.required])
				.addControl('issuer_category', '', [Validators.required])
				.addControl('issuer_street', '', Validators.required)
				.addControl('issuer_streetnumber', '', Validators.required)
				.addControl('issuer_zip', '', Validators.required)
				.addControl('issuer_city', '', Validators.required)
				.addControl('verify_intended_use', false, Validators.requiredTrue);
		}

		if (this.configService.theme.dataProcessorTermsLink) {
			this.issuerForm.addControl('agreedTerms', '', Validators.requiredTrue);
		}
	}

	initFormFromExisting(issuer: Issuer) {
		if (!issuer) return;

		const commonValues = {
			issuer_name: issuer.name,
			issuer_description: issuer.description,
			issuer_image: issuer.image,
			issuer_url: issuer.websiteUrl,
			country: issuer.country,
			state: issuer.state,
			issuer_linkedin_id: issuer.linkedinId,
		};

		const issuerSpecificValues = !this.networkForm()
			? {
					issuer_category: issuer.category,
					issuer_email: issuer.email,
					issuer_city: issuer.city,
					issuer_street: issuer.street,
					issuer_streetnumber: issuer.streetnumber,
					issuer_zip: issuer.zip,
					country: issuer.country,
					state: issuer.state,
					issuer_linkedin_id: issuer.linkedinId,
					verify_intended_use: issuer.intendedUseVerified,
				}
			: {};

		this.issuerForm.setValue({
			...commonValues,
			...issuerSpecificValues,
		});
	}

	onImageError(error: string) {
		this.imageError = error;
		const imageControl = this.issuerForm.rawControlMap.issuer_image;
		if (imageControl) {
			imageControl.setErrors({ imageError: error });
			imageControl.markAsDirty();
			imageControl.updateValueAndValidity();
		}
	}

	refreshProfile = () => {
		// Load the profile
		this.profileManager.userProfileSet.ensureLoaded();
		this.profileManager.reloadUserProfileSet();
	};

	onSubmit() {
		if (this.issuerForm.controls.issuer_image.rawControl.hasError('required')) {
			this.imageError = this.translate.instant('Issuer.imageRequiredError');
		}

		if (!this.issuerForm.markTreeDirtyAndValidate()) {
			// try scrolling to the first invalid form field
			const firstInvalidControl: HTMLElement =
				this.imageError && this.imageError.length > 0
					? this.imageField().nativeElement
					: (document.querySelector('.ng-invalid') as HTMLElement);
			if (firstInvalidControl) {
				firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' }); // smooth scroll and center
			}

			return;
		}

		const formState = this.issuerForm.value;

		if (this.networkForm()) {
			this.handleNetworkSubmit(formState);
		} else {
			this.handleIssuerSubmit(formState);
		}
	}

	private handleIssuerSubmit(formState: any) {
		const issuer: ApiIssuerForCreation | ApiIssuerForEditing = {
			name: formState.issuer_name,
			description: formState.issuer_description,
			email: formState.issuer_email,
			url: formState.issuer_url,
			category: formState.issuer_category,
			street: formState.issuer_street,
			streetnumber: formState.issuer_streetnumber,
			zip: formState.issuer_zip,
			city: formState.issuer_city,
			country: formState.country,
			state: formState.state,
			intendedUseVerified: formState.verify_intended_use,
			linkedinId: formState.issuer_linkedin_id,
		};

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}

		this.addIssuerFinished = this.issuerManager
			.createIssuer(issuer)
			.then(
				(newIssuer) => {
					this.router.navigate(['issuer/issuers', newIssuer.slug]);
					this.messageService.setMessage('Issuer created successfully.', 'success');
				},
				(error) => {
					this.messageService.setMessage('Unable to create issuer: ' + error, 'error');
				},
			)
			.then(() => (this.addIssuerFinished = null));
	}

	private handleNetworkSubmit(formState: any) {
		const network = {
			name: formState.issuer_name,
			description: formState.issuer_description,
			url: formState.issuer_url,
			country: formState.country,
			state: formState.state,
			image: formState.issuer_image,
			linkedinId: formState.issuer_linkedin_id,
		};

		this.addIssuerFinished = this.networkManager
			.createNetwork(network)
			.then((network) => {
				this.router.navigate(['issuer/networks', network.slug]);
				this.messageService.setMessage('Network created successfully.', 'success');
			})
			.then(() => (this.addIssuerFinished = null));
	}

	// onSubmit() {
	// 	if (this.issuerForm.controls.issuer_image.rawControl.hasError('required')) {
	// 		this.imageError = this.translate.instant('Issuer.imageRequiredError');
	// 	}

	// 	if (!this.issuerForm.markTreeDirtyAndValidate()) {
	// 		return;
	// 	}

	// 	const formState = this.issuerForm.value;

	// 	const issuerFormState = this.issuerOnlyForm.value;

	// 	if (this.existingIssuer) {
	// 		const issuer: ApiIssuerForEditing = {
	// 			name: formState.issuer_name,
	// 			description: formState.issuer_description,
	// 			image: formState.issuer_image,
	// 			email: issuerFormState.issuer_email,
	// 			url: formState.issuer_url,
	// 			category: issuerFormState.issuer_category,
	// 			street: issuerFormState.issuer_street,
	// 			streetnumber: issuerFormState.issuer_streetnumber,
	// 			zip: issuerFormState.issuer_zip,
	// 			city: issuerFormState.issuer_city,
	// 			country: formState.country,
	// 			state: formState.state,
	// 			intendedUseVerified: issuerFormState.verify_intended_use,
	// 		};
	// 		this.editIssuerFinished = this.issuerManager
	// 			.editIssuer(this.issuerSlug, issuer)
	// 			.then(
	// 				(newIssuer) => {
	// 					this.router.navigate(['issuer/issuers', newIssuer.slug]);
	// 					this.messageService.setMessage('Issuer created successfully.', 'success');
	// 				},
	// 				(error) => {
	// 					this.messageService.setMessage('Unable to create issuer: ' + error, 'error');
	// 				},
	// 			)
	// 			.then(() => (this.editIssuerFinished = null));
	// 	} else {
	// 		const issuer: ApiIssuerForCreation = {
	// 			name: formState.issuer_name,
	// 			description: formState.issuer_description,
	// 			email: issuerFormState.issuer_email,
	// 			url: formState.issuer_url,
	// 			category: issuerFormState.issuer_category,
	// 			street: issuerFormState.issuer_street,
	// 			streetnumber: issuerFormState.issuer_streetnumber,
	// 			zip: issuerFormState.issuer_zip,
	// 			city: issuerFormState.issuer_city,
	// 			country: formState.country,
	// 			state: formState.state,
	// 			intendedUseVerified: issuerFormState.verify_intended_use,
	// 		};

	// 		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
	// 			issuer.image = formState.issuer_image;
	// 		}

	// 		this.addIssuerFinished = this.issuerManager
	// 			.createIssuer(issuer)
	// 			.then(
	// 				(newIssuer) => {
	// 					this.router.navigate(['issuer/issuers', newIssuer.slug]);
	// 					this.messageService.setMessage('Issuer created successfully.', 'success');
	// 				},
	// 				(error) => {
	// 					this.messageService.setMessage('Unable to create issuer: ' + error, 'error');
	// 				},
	// 			)
	// 			.then(() => (this.addIssuerFinished = null));
	// 	}
	// }

	public openLinkedInInfoDialog() {
		this.dialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.linkedInIdHeaderTemplate(),
				content: this.linkedInIdBodyTemplate(),
			},
		});
	}

	get dataProcessorUrl() {
		return this.configService.theme.dataProcessorTermsLink;
	}

	urlBlurred(ev) {
		const control = this.issuerForm.rawControlMap['issuer_url'];
		UrlValidator.addMissingHttpToControl(control);
	}

	positiveIntegerString() {
		return (control: AbstractControl) => {
			const val = parseFloat(control.value);
			if (!val) return;

			if (!Number.isInteger(val) || val < 0) {
				return { negativeDuration: this.translate.instant('CreateBadge.valuePositive') };
			}
		};
	}
}
