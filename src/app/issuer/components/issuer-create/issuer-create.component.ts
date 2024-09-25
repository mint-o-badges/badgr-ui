import { Component, OnInit } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { UrlValidator } from '../../../common/validators/url.validator';
import { Title } from '@angular/platform-browser';
import { ApiIssuerForCreation } from '../../models/issuer-api.model';
import { SessionService } from '../../../common/services/session.service';
import { preloadImageURL } from '../../../common/util/file-util';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { AppConfigService } from '../../../common/app-config.service';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { TranslateService } from '@ngx-translate/core';
import { QueryParametersService } from '../../../common/services/query-parameters.service';

@Component({
	selector: 'issuer-create',
	templateUrl: './issuer-create.component.html',
	styleUrls: ['./issuer-create.component.scss'],
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	issuerForm = typedFormGroup()
		.addControl('issuer_name', '', [Validators.required, Validators.maxLength(90)])
		.addControl('issuer_description', '', [Validators.required, Validators.minLength(200), Validators.maxLength(300)])
		.addControl('issuer_email', '', [
			Validators.required,
			/*Validators.maxLength(75),
                EmailValidator.validEmail*/
		])
		.addControl('issuer_url', '', [Validators.required, UrlValidator.validUrl])
		.addControl('issuer_category', '', [Validators.required])
		.addControl('issuer_image', '', Validators.required)
		.addControl('issuer_street', '')
		.addControl('issuer_streetnumber', '')
		.addControl('issuer_zip', '')
		.addControl('issuer_city', '')

	emails: UserProfileEmail[];
	emailsOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<unknown>;
	emailsLoaded: Promise<unknown>;

	enterDescription: string; 
	issuerRequiredError: string;
	selectFromMyFiles: string;
	useImageFormat: string;
	imageError: string;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected configService: AppConfigService,
		protected profileManager: UserProfileManager,
		protected queryParams: QueryParametersService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected translate: TranslateService,
		protected issuerManager: IssuerManager,
	) {
		super(router, route, loginService);
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
		super.ngOnInit();
		this.issuerForm.rawControl.controls.issuer_image.statusChanges.subscribe((status) => {
			if (status === 'INVALID') {
				console.log(this.issuerForm.rawControl.controls.issuer_image.hasError('imageRatio'))
			//   alert(JSON.stringify(this.fileControl.errors));
			}
		  });
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
			this.imageError = "Bitte wählen Sie ein Bild aus.";
		}	
		
		if (!this.issuerForm.markTreeDirtyAndValidate()) {
			return;
		}
		
		const formState = this.issuerForm.value;
		console.log(this.issuerForm.errors)



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
		};

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}
		console.log(formState.issuer_image)


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

	get dataProcessorUrl() {
		return this.configService.theme.dataProcessorTermsLink;
	}
}
