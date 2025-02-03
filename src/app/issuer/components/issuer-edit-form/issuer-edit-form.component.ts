import { Component, OnInit, Input } from "@angular/core";
import { typedFormGroup } from "../../../common/util/typed-forms";
import { FormBuilder, Validators } from "@angular/forms";
import { IssuerNameValidator } from "../../../common/validators/issuer-name.validator";
import { UrlValidator } from "../../../common/validators/url.validator";
import { UserProfileEmail } from "../../../common/model/user-profile.model";
import { FormFieldSelectOption } from "../../../common/components/formfield-select";
import { ApiIssuerForCreation, ApiIssuerForEditing } from "../../models/issuer-api.model";
import { SessionService } from "../../../common/services/session.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AppConfigService } from "../../../common/app-config.service";
import { UserProfileManager } from "../../../common/services/user-profile-manager.service";
import { QueryParametersService } from "../../../common/services/query-parameters.service";
import { Title } from "@angular/platform-browser";
import { MessageService } from "../../../common/services/message.service";
import { TranslateService } from "@ngx-translate/core";
import { IssuerManager } from "../../services/issuer-manager.service";
import { preloadImageURL } from "../../../common/util/file-util";
import { Issuer } from "../../models/issuer.model";

@Component({
	selector: 'issuer-edit-form',
	templateUrl: 'issuer-edit-form.component.html',
	styleUrls: ['issuer-edit-form.component.scss']
})
export class IssuerEditFormComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
    issuerForm = typedFormGroup()
		.addControl('issuer_name', '', [Validators.required, Validators.maxLength(90), IssuerNameValidator.validIssuerName])
		.addControl('issuer_description', '', [Validators.required, Validators.minLength(200), Validators.maxLength(300)])
		.addControl('issuer_email', '', [
			Validators.required,
			/*Validators.maxLength(75),
                EmailValidator.validEmail*/
		])
		.addControl('issuer_url', '', [Validators.required, UrlValidator.validUrl])
		.addControl('issuer_category', '', [Validators.required])
		.addControl('issuer_image', '', Validators.required)
		.addControl('issuer_street', '', Validators.required)
		.addControl('issuer_streetnumber', '', Validators.required)
		.addControl('issuer_zip', '', Validators.required)
		.addControl('issuer_city', '', Validators.required)
		.addControl('verify_intended_use', false, Validators.requiredTrue);

	emails: UserProfileEmail[];
	emailsOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<unknown>;
	editIssuerFinished: Promise<unknown>;

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

	intendedUseCheckboxText: string; 

	existingIssuer: Issuer | null = null;

	@Input() issuerSlug: string;


	@Input() set issuer(issuer: Issuer) {
		if(this.existingIssuer !== issuer) {
			this.existingIssuer = issuer; 
			this.initFormFromExisting(issuer);
		}
	}
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
				this.emailsOptions = this.emails.map((e) => {
					return {
						label: e.email,
						value: e.email,
					};
				});
			});
	}

	ngOnInit() {
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
		})

		this.translate.get('Issuer.eligible').subscribe((translatedText: string) => {
			this.iAmEligible = translatedText;
		})

		this.translate.get('Issuer.responsible').subscribe((translatedText: string) => {
			this.iAmResponsible = translatedText;
		})	

		this.translate.get('Issuer.noMisuse').subscribe((translatedText: string) => {
			this.noMisuse = translatedText;
		})

		this.intendedUseCheckboxText = this.herebyIConfirm + ' ' + '1.) ' +  this.iAmEligible + ' ' + this.iAmResponsible + ' ' + this.noMisuse;
	}

	initFormFromExisting(issuer: Issuer) {
		if (!issuer) return;
		this.issuerForm.setValue({
			issuer_name: issuer.name,
            issuer_description: issuer.description,
			issuer_image: issuer.image,
		    issuer_category: issuer.category,
			issuer_email: issuer.email,
			issuer_city: issuer.city,
			issuer_street: issuer.street,
			issuer_streetnumber: issuer.streetnumber,
			issuer_zip: issuer.zip,
			issuer_url: issuer.websiteUrl,
			verify_intended_use: issuer.intendedUseVerified 
		});
	}

	onImageRatioError(error: string) {
		this.imageError = error;
		const imageControl = this.issuerForm.rawControlMap.issuer_image;
		if (imageControl) {
			imageControl.setErrors({ imageRatioError: error });
		}
		this.issuerForm.markTreeDirtyAndValidate()
	}

	refreshProfile = () => {
		// Load the profile
		this.profileManager.userProfileSet.ensureLoaded();
		this.profileManager.reloadUserProfileSet()
	};
	
	onSubmit() {

		if(this.issuerForm.controls.issuer_image.rawControl.hasError('required')){
			this.imageError = "Bitte wähle ein Bild aus.";
		}	
		
		if (!this.issuerForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.issuerForm.value;

		if(this.existingIssuer) {			
			const issuer: ApiIssuerForEditing= {
				name: formState.issuer_name,
				description: formState.issuer_description,
				image: formState.issuer_image,
				email: formState.issuer_email,
				url: formState.issuer_url,
				category: formState.issuer_category,
				street: formState.issuer_street,
				streetnumber: formState.issuer_streetnumber,
				zip: formState.issuer_zip,
				city: formState.issuer_city,
				intendedUseVerified: formState.verify_intended_use,
			}
			this.editIssuerFinished = this.issuerManager
			.editIssuer(this.issuerSlug, issuer)
			.then(
				(newIssuer) => {
					this.router.navigate(['issuer/issuers', newIssuer.slug]);
					this.messageService.setMessage('Issuer created successfully.', 'success');
				},
				(error) => {
					this.messageService.setMessage('Unable to create issuer: ' + error, 'error');
				},
			)
			.then(() => (this.editIssuerFinished = null));
		}
		else{

			const issuer: ApiIssuerForCreation = {
				name: formState.issuer_name,
				description: formState.issuer_description,
				email: formState.issuer_email,
				url: formState.issuer_url,
				category: formState.issuer_category,
				street: formState.issuer_street,
				streetnumber: formState.issuer_streetnumber,
				zip: formState.issuer_zip,
				city: formState.issuer_city,
				intendedUseVerified: formState.verify_intended_use,
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
		



	}

	get dataProcessorUrl() {
		return this.configService.theme.dataProcessorTermsLink;
	}

	urlBlurred(ev) {
		const control = this.issuerForm.rawControlMap['issuer_url'];
		UrlValidator.addMissingHttpToControl(control);
	}
}