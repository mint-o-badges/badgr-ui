import { Component, Input, inject } from '@angular/core';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { typedFormGroup } from '../../../common/util/typed-forms';
import { ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateValidator } from '../../../common/validators/date.validator';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { BgImageStatusPlaceholderDirective } from '../../../common/directives/bg-image-status-placeholder.directive';
import { OebInputComponent } from '../../../components/input.component';
import { OebCheckboxComponent } from '../../../components/oeb-checkbox.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { IssuerManager } from '~/issuer/services/issuer-manager.service';
import { Issuer } from '~/issuer/models/issuer.model';

@Component({
	selector: 'edit-qr-form',
	templateUrl: './edit-qr-form.component.html',
	imports: [
		BgAwaitPromises,
		FormsModule,
		ReactiveFormsModule,
		BgImageStatusPlaceholderDirective,
		OebInputComponent,
		OebCheckboxComponent,
		OebButtonComponent,
		TranslatePipe,
	],
})
export class EditQrFormComponent extends BaseAuthenticatedRoutableComponent {
	static datePipe = new DatePipe('de');

	@Input() editing: boolean = false;

	qrCodePromise: Promise<any> | null = null;

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get isNetworkBadge() {
		return this.route.snapshot.queryParams['isNetworkBadge'];
	}

	get partnerIssuerSlug() {
		return this.route.snapshot.queryParams['partnerIssuer'];
	}

	get qrSlug() {
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeClass: BadgeClass;
	issuer: Issuer;

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	badgeClassLoaded: Promise<unknown>;
	issuerLoaded: Promise<unknown>;
	crumbs: LinkEntry[];

	qrForm = typedFormGroup(this.missingStartDate.bind(this))
		.addControl('title', '', Validators.required)
		.addControl('createdBy', '', Validators.required)
		.addControl('valid_from', '', DateValidator.validDate)
		.addControl('expires_at', '', [DateValidator.validDate, this.validDateRange.bind(this)])
		.addControl('badgeclass_id', '', Validators.required)
		.addControl('issuer_id', '', Validators.required)
		.addControl('notifications', false);

	constructor(
		route: ActivatedRoute,
		router: Router,
		sessionService: SessionService,
		protected translate: TranslateService,
		protected qrCodeApiService: QrCodeApiService,
		protected badgeClassManager: BadgeClassManager,
		protected issuerManager: IssuerManager,
		protected _location: Location,
	) {
		super(router, route, sessionService);

		if (this.isNetworkBadge) {
			this.badgeClassLoaded = this.badgeClassManager
				.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
				.then((badgeClass) => {
					this.badgeClass = badgeClass;
					return this.issuerManager.issuerBySlug(this.partnerIssuerSlug);
				})
				.then((partnerIssuer) => {
					this.issuer = partnerIssuer;
				});
		} else {
			this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
				this.issuer = issuer;
			});

			this.badgeClassLoaded = this.badgeClassManager
				.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
				.then((badgeClass) => {
					this.badgeClass = badgeClass;

					this.crumbs = [
						{ title: 'Issuers', routerLink: ['/issuer'] },
						{
							// title: issuer.name,
							title: 'issuer',
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
				});
		}

		if (this.qrSlug) {
			this.qrCodeApiService.getQrCode(this.qrSlug).then((qrCode) => {
				this.qrForm.setValue({
					title: qrCode.title,
					createdBy: qrCode.createdBy,
					valid_from: qrCode.valid_from
						? EditQrFormComponent.datePipe.transform(new Date(qrCode.valid_from), 'yyyy-MM-dd')
						: undefined,
					expires_at: qrCode.expires_at
						? EditQrFormComponent.datePipe.transform(new Date(qrCode.expires_at), 'yyyy-MM-dd')
						: undefined,
					badgeclass_id: qrCode.badgeclass_id,
					issuer_id: qrCode.issuer_id,
					notifications: qrCode.notifications,
				});
			});
		}

		this.qrForm.setValue({
			...this.qrForm.value,
			badgeclass_id: this.badgeSlug,
			issuer_id: this.issuerSlug,
		});
	}
	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: this.translate.instant('QrCode.savedSuccessfully'),
				variant: 'success',
			},
		});
	}

	previousPage() {
		this._location.back();
	}

	missingStartDate(): ValidationErrors | null {
		if (!this.qrForm) return null;
		const valid_from = this.qrForm.controls.valid_from.value;
		const expires = this.qrForm.controls.expires_at.value;

		if (expires && !valid_from) {
			return { noStartDate: true };
		}
	}

	validDateRange(): ValidationErrors | null {
		if (!this.qrForm) return null;

		const valid_from = this.qrForm.controls.valid_from.value;
		const expires = this.qrForm.controls.expires_at.value;

		if (valid_from && expires && new Date(expires) <= new Date(valid_from)) {
			return { expiresBeforeValidFrom: true };
		}

		return null;
	}

	onSubmit() {
		if (!this.qrForm.markTreeDirtyAndValidate()) {
			return;
		}

		if (this.editing) {
			const formState = this.qrForm.value;
			this.qrCodePromise = this.qrCodeApiService
				.updateQrCode(this.issuerSlug, this.badgeSlug, this.qrSlug, {
					title: formState.title,
					createdBy: formState.createdBy,
					expires_at: formState.expires_at ? new Date(formState.expires_at).toISOString() : null,
					valid_from: formState.valid_from ? new Date(formState.valid_from).toISOString() : null,
					badgeclass_id: this.badgeSlug,
					issuer_id: this.issuerSlug,
					notifications: formState.notifications,
				})
				.then((qrcode) => {
					this.openSuccessDialog();
					this.router.navigate([
						'/issuer/issuers',
						this.issuerSlug,
						'badges',
						this.badgeSlug,
						'qr',
						qrcode.slug,
						'generate',
					]);
				});
		} else {
			const formState = this.qrForm.value;
			const issuer = this.isNetworkBadge && this.partnerIssuerSlug ? this.partnerIssuerSlug : this.issuerSlug;
			this.qrCodePromise = this.qrCodeApiService
				.createQrCode(issuer, this.badgeSlug, {
					title: formState.title,
					createdBy: formState.createdBy,
					badgeclass_id: formState.badgeclass_id,
					issuer_id: this.isNetworkBadge ? this.partnerIssuerSlug : formState.issuer_id,
					expires_at: formState.expires_at ? new Date(formState.expires_at).toISOString() : undefined,
					valid_from: formState.valid_from ? new Date(formState.valid_from).toISOString() : undefined,
					notifications: formState.notifications,
				})
				.then((qrcode) => {
					this.openSuccessDialog();
					this.router.navigate([
						'/issuer/issuers',
						this.issuerSlug,
						'badges',
						this.badgeSlug,
						'qr',
						qrcode.slug,
						'generate',
					]);
				});
		}
	}
}
