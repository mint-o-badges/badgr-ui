import { Component, inject } from "@angular/core";
import { BaseRoutableComponent } from "../../../common/pages/base-routable.component";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { HlmDialogService } from "../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { DangerDialogComponent } from "../../../common/dialogs/oeb-dialogs/danger-dialog.component";
import { UserProfileManager } from "../../../common/services/user-profile-manager.service";
import { UserProfileApiService } from "../../../common/services/user-profile-api.service";
import { IssuerApiService } from "../../../issuer/services/issuer-api.service";
import { ApiIssuerForEditing } from "../../../issuer/models/issuer-api.model";

@Component({
    selector: "app-new-terms",
    templateUrl: "./new-terms.component.html",
    })
export class NewTermsComponent extends BaseRoutableComponent {

  confirmed = false;

  constructor(
    router: Router,
    route: ActivatedRoute,
    private translate: TranslateService,
		private profileManager: UserProfileManager,
    private userProfileApiService: UserProfileApiService,
    private issuerApiService: IssuerApiService
  ) {
    super(router, route);
  }
  
  changeConfirmed(value) {
		this.confirmed = value;
	}

  sendConfirmation(){
    if(!this.confirmed){
	    this.openErrorDialog() 

    }
    else{
      this.router.navigate(['public/about/newsletter']);  
      this.profileManager.userProfilePromise.then((profile) => {
        profile.agreeToLatestTerms().then(() => {
          this.userProfileApiService.getOwnedInstitutions().then((institutions) => {
            institutions.forEach((institution) => {
              const issuer: ApiIssuerForEditing= {
                name: institution.name,
                description: institution.description,
                email: institution.email,
                url: institution.url,
                category: institution.category,
                street: institution.street,
                streetnumber: institution.streetnumber,
                zip: institution.zip,
                city: institution.city,
                intendedUseVerified: institution.intendedUseVerified,
              }
              this.issuerApiService.editIssuer(institution.slug, {
                ...issuer,
                intendedUseVerified: true
              });
            });        
          })
        })
      });
    }
  }

 
	private readonly _hlmDialogService = inject(HlmDialogService);
	public openErrorDialog() {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
        caption: this.translate.instant('TermsOfService.cantUseWithoutConfirmation'),
				variant: 'danger',
        singleButtonText: this.translate.instant('General.back')
			},
		});
	}



}