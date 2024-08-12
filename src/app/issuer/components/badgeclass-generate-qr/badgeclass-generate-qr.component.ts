import { Component, OnInit, inject } from "@angular/core";
import { LinkEntry } from "../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { BadgeClassManager } from "../../services/badgeclass-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { SessionService } from "../../../common/services/session.service";
import { BadgeClass } from "../../models/badgeclass.model";
import { SafeUrl } from "@angular/platform-browser";
import { BadgeRequestApiService } from "../../services/badgerequest-api.service";
import { HlmDialogService } from "../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { SuccessDialogComponent } from "../../../common/dialogs/oeb-dialogs/success-dialog.component";
import { DangerDialogComponent } from "../../../common/dialogs/oeb-dialogs/danger-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { QrCodeApiService } from "../../services/qrcode-api.service";
import { DatePipe } from "@angular/common";


@Component({
	selector: 'badgeclass-generate-qr',
	templateUrl: './badgeclass-generate-qr.component.html',
	styleUrls: ['../../../public/components/about/about.component.css']
})
export class BadgeClassGenerateQrComponent extends BaseAuthenticatedRoutableComponent implements OnInit{
	static datePipe = new DatePipe('de');

    get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get qrSlug(){
		return this.route.snapshot.params['qrCodeId'];
	}

	badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	badgeClass: BadgeClass;


	badgeClassLoaded: Promise<unknown>;
    crumbs: LinkEntry[]

    qrData: string;
	qrTitle: string ;
	qrCodeCSS: string = "tw-border-solid tw-border-purple tw-border-[3px] tw-p-2 tw-rounded-2xl tw-max-w-[265px] md:tw-max-w-[350px]";
	issuer: string;
	creator: string;
	valid: boolean = true;
	validity: string;
	valid_from: Date;
	expires_at: Date;
	editQrCodeLink: string = `/issuer/issuers/${this.issuerSlug}/badges/${this.badgeSlug}/qr/${this.qrSlug}/edit`;
	qrCodeWidth = 244; 
    public qrCodeDownloadLink: SafeUrl = "";

    constructor(
        route: ActivatedRoute,
        router: Router,
        sessionService: SessionService,
		protected badgeClassManager: BadgeClassManager,
		protected badgeRequestApiService: BadgeRequestApiService,
		protected translate: TranslateService,
		protected qrCodeApiService: QrCodeApiService

        ){
            super(router, route, sessionService);

            this.badgeClassLoaded = this.badgeClassManager
				.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
				.then((badgeClass) => {
					this.badgeClass = badgeClass;

					let im = this.badgeClass.issuerManager
					im.issuerBySlug(this.issuerSlug).then((issuer) => {
						this.issuer = issuer.name;
					})

					


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
						{ 
							title: 'Award Badge',
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug, 'qr']
						},
						{
							title: 'Generate QR',
						}
					];
				});

				
        

    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
		  this.qrTitle = params['title'];
		  this.creator = params['createdBy'];
		  this.valid_from = params['valid_from'];
		  this.expires_at = params['expires_at'];
		  this.validity = BadgeClassGenerateQrComponent.datePipe.transform(new Date(this.valid_from), 'dd.MM.yyyy')   + ' - ' + BadgeClassGenerateQrComponent.datePipe.transform(new Date(this.expires_at), 'dd.MM.yyyy');
        });

		if(this.valid_from !=  null || this.expires_at != null){
			if(new Date(this.valid_from) < new Date() && new Date(this.expires_at) >= new Date()){
				this.valid = true;
			}else{
				this.valid = false;
			}
		}
		if(this.valid){
			this.qrData = `https://openbadges.education/issuer/badges/${this.badgeSlug}/request/${this.qrSlug}`;
		}else{
			this.qrData = "Die Gültigkeit dieses Qr Codes ist abgelaufen.";
		}

    }

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
                text: this.translate.instant('QrCode.downloadedSuccessfully'),
				variant: "success"
			},
		});
	}

	public openDangerDialog() {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				delete: this.deleteQrCode.bind(this),
				// text: kthis.translate.instant('QrCode.downloadFailed'),
				variant: "danger"
			},
		});
	}

	deleteQrCode() {
		this.qrCodeApiService.deleteQrCode(this.issuerSlug, this.badgeSlug, this.qrSlug).then(() => {
			console.log('QrCode deleted');
			
		}
	)};


    onChangeURL(url: SafeUrl) {
        this.qrCodeDownloadLink = url;
    }

   
}