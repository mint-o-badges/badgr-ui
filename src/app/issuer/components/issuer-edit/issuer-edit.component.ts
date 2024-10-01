import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { UrlValidator } from '../../../common/validators/url.validator';
import { Title } from '@angular/platform-browser';
import { ApiIssuerForEditing } from '../../models/issuer-api.model';
import { Issuer } from '../../models/issuer.model';

import { preloadImageURL } from '../../../common/util/file-util';
import { FormFieldSelectOption } from '../../../common/components/formfield-select';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { UserProfileEmail } from '../../../common/model/user-profile.model';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { typedFormGroup } from '../../../common/util/typed-forms';

@Component({
	selector: 'issuer-edit',
	templateUrl: './issuer-edit.component.html',
})
export class IssuerEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	issuer: Issuer;
	issuerSlug: string;

	issuerForm = typedFormGroup()
		.addControl('issuer_name', '', [Validators.required, Validators.maxLength(1024)])
		.addControl('issuer_description', '', [Validators.required, Validators.maxLength(1024)])
		.addControl('issuer_email', '', [Validators.required])
		.addControl('issuer_url', '', [Validators.required, UrlValidator.validUrl])
		.addControl('issuer_image', '')
		.addControl('issuer_category', '', [Validators.required])
		.addControl('issuer_image', '')
		.addControl('issuer_street', '', Validators.required)
		.addControl('issuer_streetnumber', '', Validators.required)
		.addControl('issuer_zip', '', Validators.required)
		.addControl('issuer_city', '', Validators.required);

	emails: UserProfileEmail[];
	emailsOptions: FormFieldSelectOption[];

	editIssuerFinished: Promise<unknown>;
	emailsLoaded: Promise<unknown>;
	issuerLoaded: Promise<unknown>;

	editIssuerCrumbs: LinkEntry[];

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected profileManager: UserProfileManager,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected configService: AppConfigService,
		protected issuerManager: IssuerManager,
	) {
		super(router, route, loginService);
		title.setTitle(`Edit Issuer - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;

				this.editIssuerCrumbs = [
					{ title: 'Issuers', routerLink: ['/issuer'] },
					{ title: issuer.name, routerLink: ['/issuer/issuers/', this.issuerSlug] },
					{ title: 'Edit Issuer' },
				];

				this.issuerForm.setValue(
					{
						issuer_name: this.issuer.name,
						issuer_description: this.issuer.description,
						issuer_email: this.issuer.email,
						issuer_url: this.issuer.websiteUrl,
						issuer_image: this.issuer.image,
						issuer_category: this.issuer.category,
						issuer_street: this.issuer.street,
						issuer_streetnumber: this.issuer.streetnumber,
						issuer_zip: this.issuer.zip,
						issuer_city: this.issuer.city,
					},
					{ emitEvent: false },
				);

				this.title.setTitle(
					`Issuer - ${this.issuer.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
			},
			(error) => {
				this.messageService.reportLoadingError(`Issuer '${this.issuerSlug}' does not exist.`, error);
			},
		);

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
	}

	onSubmit() {
		if (!this.issuerForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.issuerForm.value;

		const issuer: ApiIssuerForEditing = {
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

	urlBlurred(ev) {
		const control = this.issuerForm.rawControlMap['issuer_url'];
		UrlValidator.addMissingHttpToControl(control);
	}
}
