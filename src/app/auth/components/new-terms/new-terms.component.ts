import { Component, inject } from "@angular/core";
import { BaseRoutableComponent } from "../../../common/pages/base-routable.component";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { HlmDialogService } from "../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service";
import { DangerDialogComponent } from "../../../common/dialogs/oeb-dialogs/danger-dialog.component";
import { UserProfileApiService } from "../../../common/services/user-profile-api.service";

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
    private userProfileApiService: UserProfileApiService

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
      this.userProfileApiService.getProfile().then(profile => {
        this.userProfileApiService.
        updateProfile({...profile,  agreed_terms_version: 2 }).then(
          (profile) => {
            console.log('Profile updated', profile);
          }
        );
      });
    }
  }

 
	private readonly _hlmDialogService = inject(HlmDialogService);
	public openErrorDialog() {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
        caption: this.translate.instant('TermsOfService.cantUseWithoutConfirmation'),
				variant: 'danger',
        singleButtonText: this.translate.instant('TermsOfService.backToTerms')
			},
		});
	}



}