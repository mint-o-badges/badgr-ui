import { Component, Input, inject } from '@angular/core';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BadgeRequestApiService } from '../../services/badgerequest-api.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { HlmDialogService } from './../../../components/spartan/ui-dialog-helm/src';
import { PublicApiService } from '../../../public/services/public-api.service';
import { BadgeRequest } from '../../models/badgerequest-api.model';
import { PublicApiBadgeClassWithIssuer } from '../../../public/models/public-api.model';
import { EmailValidator } from '../../../common/validators/email.validator';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { BgImageStatusPlaceholderDirective } from '../../../common/directives/bg-image-status-placeholder.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { OebInputComponent } from '../../../components/input.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';

@Component({
    selector: 'request-badge',
    templateUrl: './request-badge.component.html',
    imports: [
        BgAwaitPromises,
        HlmH1Directive,
        BgImageStatusPlaceholderDirective,
        HlmPDirective,
        FormsModule,
        ReactiveFormsModule,
        OebInputComponent,
        OebCheckboxComponent,
        OebButtonComponent,
        TranslatePipe,
    ],
})
export class RequestBadgeComponent extends BaseRoutableComponent {
	constructor(
		private translate: TranslateService,
		private badgeRequestApiService: BadgeRequestApiService,
		protected publicApiService: PublicApiService,
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route);
		this.badgeClassLoaded = this.publicApiService
			.getBadgeClass(this.badgeSlug)
			.then((badge: PublicApiBadgeClassWithIssuer) => {
				this.badgeClass = badge;
			});
	}

	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text:
					this.translate.instant('RequestBadge.successMessage') +
					this.translate.instant('RequestBadge.successMessage2'),
				variant: 'success',
			},
		});
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get qrSlug() {
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeClassLoaded: Promise<unknown>;
	badgeClass: PublicApiBadgeClassWithIssuer;

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	ngOnInit(): void {
		this.requestForm.setValue({
			...this.requestForm.value,
			qrCodeId: this.qrSlug,
		});
	}

	requestBadge = this.translate.instant('RequestBadge.requestBadge');

	requestForm = typedFormGroup(this.nameValidation.bind(this))
		.addControl('firstname', '', Validators.required)
		.addControl('lastname', '', Validators.required)
		.addControl('email', '', [Validators.required, EmailValidator.validEmail])
		.addControl('qrCodeId', '', Validators.required)
		.addControl('ageConfirmation', false, Validators.requiredTrue);

	onSubmit() {
		if (!this.requestForm.markTreeDirtyAndValidate()) {
			return;
		}

		const formState = this.requestForm.value;

		const userData: BadgeRequest = {
			firstname: formState.firstname,
			lastname: formState.lastname,
			email: formState.email,
			ageConfirmation: formState.ageConfirmation,
			qrCodeId: formState.qrCodeId,
		};

		this.badgeRequestApiService.requestBadge(this.qrSlug, userData).then((response) => {
			if (response.ok) {
				this.openSuccessDialog();
				// TODO: check if this is correct
				this.router.navigate(['/catalog/badges']);
			}
		});
	}

	nameValidation() {
		if (!this.requestForm) return null;

		const value = this.requestForm.value;
		const firstname = value.firstname;
		const lastname = value.lastname;
		if (firstname.length + lastname.length > 35) {
			return {
				maxLengthExceeded: true,
			};
		}
		return null;
	}
}
