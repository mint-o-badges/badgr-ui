import { Component, OnInit, Input } from '@angular/core';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IssuerNameValidator } from '../../../common/validators/issuer-name.validator';
import { UrlValidator } from '../../../common/validators/url.validator';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppConfigService } from '../../../common/app-config.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NetworkManager } from '../../services/network-manager.service';
import { preloadImageURL } from '../../../common/util/file-util';
import { BgFormFieldImageComponent } from '../../../common/components/formfield-image';
import { OebInputComponent } from '../../../components/input.component';
import { OebSelectComponent } from '../../../components/select.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { countries } from 'countries-list';
import * as states from '../../../../assets/data/german-states.json';
import type { TCountries, ICountry, ICountryData } from 'countries-list';
import { ApiNetworkForCreation } from '~/issuer/models/network-api.model';
import { Network } from '../../../issuer/models/network.model';

@Component({
	selector: 'network-edit-form',
	templateUrl: 'network-edit-form.component.html',
	styleUrls: ['network-edit-form.component.scss'],
	imports: [
		FormsModule,
		BgFormFieldImageComponent,
		OebInputComponent,
		OebSelectComponent,
		ReactiveFormsModule,
		OebButtonComponent,
		RouterLink,
		TranslatePipe,
	],
})
export class NetworkEditFormComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	networkForm = typedFormGroup()
		.addControl('name', '', [Validators.required, Validators.maxLength(90), IssuerNameValidator.validIssuerName])
		.addControl('description', '', [Validators.required, Validators.minLength(200), Validators.maxLength(300)])
		.addControl('url', '', [Validators.required, UrlValidator.validUrl])
		.addControl('image', '', Validators.required)
		.addControl('country', 'Germany', Validators.required)
		.addControl('state', '');

	_countriesOptions: FormFieldSelectOption[];
	_germanStateOptions: FormFieldSelectOption[];
	addNetworkFinished: Promise<unknown>;
	editNetworkFinished: Promise<unknown>;

	enterDescription: string;
	networkRequiredError: string;
	invalidCharacterError: string = '';
	selectFromMyFiles: string;
	useImageFormat: string;
	imageError: string;

	existingNetwork: Network | null = null;

	@Input() networkSlug: string;

	@Input() set network(network: Network) {
		if (this.existingNetwork !== network) {
			this.existingNetwork = network;
			this.initFormFromExisting(network);
		}
	}
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected configService: AppConfigService,
		protected profileManager: UserProfileManager,
		protected queryParams: QueryParametersService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected translate: TranslateService,
		protected networkManager: NetworkManager,
	) {
		title.setTitle(`Create Network - ${this.configService.theme['serviceName'] || 'Badgr'}`);

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
		this.translate.get('Issuer.enterDescription').subscribe((translatedText: string) => {
			this.enterDescription = translatedText;
		});
		this.translate.get('Issuer.enterName').subscribe((translatedText: string) => {
			this.networkRequiredError = translatedText;
		});
		this.translate.get('RecBadge.selectFromMyFiles').subscribe((translatedText: string) => {
			this.selectFromMyFiles = translatedText;
		});
		this.translate.get('Issuer.useImageFormat').subscribe((translatedText: string) => {
			this.useImageFormat = translatedText;
		});
	}

	initFormFromExisting(network: Network) {
		if (!network) return;
		this.networkForm.setValue({
			name: network.name,
			description: network.description,
			image: network.image,
			url: network.websiteUrl,
			country: network.country,
			state: network.state,
		});
	}

	onImageError(error: string) {
		this.imageError = error;
		const imageControl = this.networkForm.rawControlMap.image;
		if (imageControl) {
			imageControl.setErrors({ imageError: error });
		}
		this.networkForm.markTreeDirtyAndValidate();
	}

	onSubmit() {
		if (this.networkForm.controls.image.rawControl.hasError('required')) {
			this.imageError = this.translate.instant('Issuer.imageRequiredError');
		}

		if (!this.networkForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.networkForm.value;

		if (this.existingNetwork) {
		} else {
			const network: ApiNetworkForCreation = {
				name: formState.name,
				description: formState.description,
				url: formState.url,
				image: formState.image,
				country: formState.country,
				state: formState.state,
			};
			this.addNetworkFinished = this.networkManager
				.createNetwork(network)
				.then(
					(newNetwork) => {
						this.router.navigate(['issuer/networks', newNetwork.slug]);
						this.messageService.setMessage('Network created successfully.', 'success');
					},
					(error) => {
						this.messageService.setMessage('Unable to create Network: ' + error, 'error');
					},
				)
				.then(() => (this.addNetworkFinished = null));
		}
	}
}
