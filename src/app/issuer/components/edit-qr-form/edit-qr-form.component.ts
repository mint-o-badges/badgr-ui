import { Component, Input, inject } from "@angular/core";
import { LinkEntry } from "../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { BadgeClassManager } from "../../services/badgeclass-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { SessionService } from "../../../common/services/session.service";
import { BadgeClass } from "../../models/badgeclass.model";
import { typedFormGroup } from "../../../common/util/typed-forms";
import { FormControl, ValidationErrors, Validators } from "@angular/forms";
import { DateValidator } from "../../../common/validators/date.validator";
import { QrCodeApiService } from "../../services/qrcode-api.service";
import { HlmDialogService } from "../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { SuccessDialogComponent } from "../../../common/dialogs/oeb-dialogs/success-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
import { Location } from "@angular/common";

@Component({
	selector: 'edit-qr-form',
	templateUrl: './edit-qr-form.component.html',
})
export class EditQrFormComponent extends BaseAuthenticatedRoutableComponent  {

	static datePipe = new DatePipe('de');

    @Input() editing: boolean = false;

    get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get qrSlug(){
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeClass: BadgeClass;

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';


	badgeClassLoaded: Promise<unknown>;
    crumbs: LinkEntry[]

    qrForm = typedFormGroup()
        .addControl('title', '', Validators.required)
        .addControl('createdBy', '', Validators.required)
		.addControl('valid_from', '', DateValidator.validDate)
		.addControl('expires_at', '', [DateValidator.validDate, this.validDateRange.bind(this)])
		.addControl('badgeclass_id', '', Validators.required)
		.addControl('issuer_id', '', Validators.required)
	
	

    constructor(
        route: ActivatedRoute,
        router: Router,
        sessionService: SessionService,
		protected translate: TranslateService,
		protected qrCodeApiService: QrCodeApiService,
		protected badgeClassManager: BadgeClassManager,
		protected _location: Location

        ){
            super(router, route, sessionService);


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
			
				this.qrCodeApiService.getQrCode(this.qrSlug).then((qrCode) => {
					this.qrForm.setValue({
						title: qrCode.title,
						createdBy: qrCode.createdBy,
						valid_from: qrCode.valid_from ? EditQrFormComponent.datePipe.transform(new Date(qrCode.valid_from), 'yyyy-MM-dd') : undefined,
						expires_at: qrCode.expires_at ? EditQrFormComponent.datePipe.transform(new Date(qrCode.expires_at),  'yyyy-MM-dd') : undefined,
						badgeclass_id: qrCode.badgeclass_id,
						issuer_id: qrCode.issuer_id
					});
				});
			
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
				variant: "success"
			},
		});
	}

	previousPage(){
		this._location.back();
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

		if(this.editing){
			console.log('editing')
			const formState = this.qrForm.value;
			this.qrCodeApiService.updateQrCode(this.issuerSlug, this.badgeSlug, this.qrSlug, {
				title: formState.title,
				createdBy: formState.createdBy,
				expires_at: formState.expires_at ? new Date(formState.expires_at).toISOString() : undefined,
				valid_from: formState.valid_from ? new Date(formState.valid_from).toISOString() : undefined,
				badgeclass_id: this.badgeSlug,
				issuer_id: this.issuerSlug
			}).then((qrcode) => {
                this.openSuccessDialog()
                this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', qrcode.slug, 'generate']);
            }
        )
		}
		else{

		const formState = this.qrForm.value;
		this.qrCodeApiService.createQrCode(this.issuerSlug, this.badgeSlug, {
			title: formState.title,
			createdBy: formState.createdBy,
			badgeclass_id: formState.badgeclass_id,
			issuer_id: formState.issuer_id,
			expires_at: formState.expires_at ? new Date(formState.expires_at).toISOString() : undefined ,
			valid_from: formState.valid_from ? new Date(formState.valid_from).toISOString() : undefined
		}).then((qrcode) => {
                this.openSuccessDialog()
                this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', qrcode.slug, 'generate']);
            }
        )
    }}   
}