import { Component, Input, inject } from "@angular/core";
import { LinkEntry } from "../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { BadgeClassManager } from "../../services/badgeclass-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { SessionService } from "../../../common/services/session.service";
import { BadgeClass } from "../../models/badgeclass.model";
import { typedFormGroup } from "../../../common/util/typed-forms";
import { Validators } from "@angular/forms";
import { DateValidator } from "../../../common/validators/date.validator";
import { QrCodeApiService } from "../../services/qrcode-api.service";
import { HlmDialogService } from "../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { SuccessDialogComponent } from "../../../common/dialogs/oeb-dialogs/success-dialog.component";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: 'edit-qr-form',
	templateUrl: './edit-qr-form.component.html',
})
export class EditQrFormComponent extends BaseAuthenticatedRoutableComponent{

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
		.addControl('expires_at', '', DateValidator.validDate)
		.addControl('badgeclass_id', '', Validators.required)
		.addControl('issuer_id', '', Validators.required);
        
		


    constructor(
        route: ActivatedRoute,
        router: Router,
        sessionService: SessionService,
		protected translate: TranslateService,
		protected qrCodeApiService: QrCodeApiService,
		protected badgeClassManager: BadgeClassManager,

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

    onSubmit() {
		// if (!this.qrForm.markTreeDirtyAndValidate()) {
		// 	return;
		// }

		if(this.editing){
			console.log('editing')
			const formState = this.qrForm.value;
			this.qrCodeApiService.updateQrCode(this.issuerSlug, this.badgeSlug, this.qrSlug, {
				title: formState.title,
				createdBy: formState.createdBy,
				expires_at: new Date(formState.expires_at).toISOString() ,
				valid_from: new Date(formState.valid_from).toISOString(),
				badgeclass_id: this.badgeSlug,
				issuer_id: this.issuerSlug
			}).then((qrcode) => {
                this.openSuccessDialog()
                this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', qrcode.slug, 'generate'], {queryParams: formState});
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
			expires_at: new Date(formState.expires_at).toISOString() ,
			valid_from: new Date(formState.valid_from).toISOString()
		}).then((qrcode) => {
                this.openSuccessDialog()
                // this.router.navigate(['/issuer/issuers', 'badges', this.badgeSlug], {queryParams: formState});
                this.router.navigate(['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr', qrcode.slug, 'generate'], {queryParams: formState});
            }
        )
    }}   
}