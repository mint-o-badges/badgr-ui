import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { EmailValidator, ValidationResult } from '../../../common/validators/email.validator';

import { CollectionBadgeInstanceManager } from '../../services/collectionbadge-instance-manager.service';
import { IssuerManager } from '../../services/issuer-manager.service';

import { Issuer } from '../../models/issuer.model';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { RecipientIdentifierType } from '../../models/badgeinstance-api.model';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { TelephoneValidator } from '../../../common/validators/telephone.validator';
import { EventsService } from '../../../common/services/events.service';
import { FormFieldTextInputType } from '../../../common/components/formfield-text';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { CollectionBadge } from '../../models/collectionbadge.model';
import { CollectionBadgeManager } from '../../services/collectionbadge-manager.service';

@Component({
	selector: 'collectionbadgeclass-issue',
	templateUrl: './collectionbadgeclass-issue.component.html',
})
export class CollectionBadgeClassIssueComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	breadcrumbLinkEntries: LinkEntry[] = [];

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get recipientIdentifierFieldType(): FormFieldTextInputType {
		switch (this.issueForm.controls.recipient_type.value) {
			case 'email':
				return 'email';
			case 'openBadgeId':
				return 'text';
			case 'telephone':
				return 'tel';
			case 'url':
				return 'url';
			default:
				return 'text';
		}
	}

	idError: string | boolean = false;
	dateError = false;

	issuer: Issuer;
	issueForm = typedFormGroup()
		.addControl('recipient_type', 'email' as RecipientIdentifierType, [Validators.required], (control) => {
			control.rawControl.valueChanges.subscribe(() => {
				this.issueForm.controls.recipient_identifier.rawControl.updateValueAndValidity();
			});
		})
		.addControl('recipient_identifier', '', [Validators.required, this['idValidator']])
		.addControl('recipientprofile_name', '')
		.addControl('notify_earner', true);

	collectionBadgeClass: CollectionBadge;

	issueCollectionBadgeFinished: Promise<unknown>;
	issuerLoaded: Promise<unknown>;
	collectionBadgeClassLoaded: Promise<unknown>;

	identifierOptionMap = {
		email: 'E-Mail Adresse',
		url: 'URL',
		// telephone: "Telephone",
	};

	idValidator: (control: FormControl) => ValidationResult = (control) => {
		if (this.issueForm) {
			switch (this.issueForm.controls.recipient_type.value) {
				case 'email':
					return EmailValidator.validEmail(control);
				case 'openBadgeId':
					return null;
				case 'telephone':
					return TelephoneValidator.validTelephone(control);
				//case 'url': return UrlValidator.validUrl(control);
				default:
					return null;
			}
		} else {
			return null;
		}
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected eventsService: EventsService,
		protected issuerManager: IssuerManager,
		// protected badgeClassManager: BadgeClassManager,
		protected collectionBadgeManager: CollectionBadgeManager,
		protected collectionBadgeInstanceManager: CollectionBadgeInstanceManager,
		protected dialogService: CommonDialogsService,
		protected configService: AppConfigService,
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route, sessionService);
		title.setTitle(`Award Badge - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;

			this.collectionBadgeClassLoaded = this.collectionBadgeManager
				.collectionbadgeById(this.badgeSlug)
				.then((badgeClass) => {
					this.collectionBadgeClass = badgeClass;

					this.breadcrumbLinkEntries = [
						{ title: 'Issuers', routerLink: ['/issuer'] },
						{
							title: issuer.name,
							routerLink: ['/issuer/issuers', this.issuerSlug],
						},
						{
							title: 'badges',
							routerLink: ['/issuer/issuers/' + this.issuerSlug + '/badges/'],
						},
						{
							title: badgeClass.name,
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug],
						},
						{ title: 'Award Badge' },
					];

					this.title.setTitle(
						`Award Badge - ${badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
					);
				});
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit() {
		if (!this.issueForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.issueForm.value;

		const isIDValid = this.idValidator(this.issueForm.controls.recipient_identifier.rawControl);
		if (isIDValid) {
			Object.keys(isIDValid).forEach((key) => {
				this.idError = key;
			});
			return false;
		} else {
			this.idError = false;
		}

		this.issueCollectionBadgeFinished = this.collectionBadgeInstanceManager
			.createBadgeInstance(this.issuerSlug, this.badgeSlug, {
				issuer: this.issuerSlug,
				collectionbadge_class: this.badgeSlug,
				recipient_type: formState.recipient_type,
				recipient_identifier: formState.recipient_identifier,
				create_notification: formState.notify_earner,
			})
			// .then(() => this.collectionBadgeClass.update())
			.then(
				() => {
					this.eventsService.recipientBadgesStale.next([]);
					this.router.navigate([
						'issuer/issuers',
						this.issuerSlug,
						'collectionbadges',
						this.collectionBadgeClass.slug,
					]);
					this.messageService.setMessage('Badge awarded to ' + formState.recipient_identifier, 'success');
				},
				(error) => {
					this.messageService.setMessage(
						'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
						'error',
					);
				},
			)
			.then(() => (this.issueCollectionBadgeFinished = null));
	}
}
