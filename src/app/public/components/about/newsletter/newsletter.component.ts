import { Component, OnInit, inject} from '@angular/core';
import { SuccessDialogComponent } from '../../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { HlmDialogService } from '../../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseRoutableComponent } from '../../../../common/pages/base-routable.component';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { Validators } from '@angular/forms';
import { UserProfileApiService } from '../../../../common/services/user-profile-api.service';
import { SessionService } from '../../../../common/services/session.service';

@Component({
	selector: 'about-newsletter',
	templateUrl: './newsletter.component.html',
	styleUrls: ['../about.component.css'],
})
export class NewsletterComponent extends BaseRoutableComponent implements OnInit {

    newsletterForm = typedFormGroup({
    })
    .addControl('email', '', Validators.required)
    .addControl('firstName', '', Validators.required)
    .addControl('lastName', '', Validators.required)
    constructor(
        private translate: TranslateService, 
        private userProfileApiService: UserProfileApiService,
        private sessionService: SessionService,
		router: Router,
        route: ActivatedRoute
        ) {
            super(router, route);
    }

    ngOnInit(): void {
        this.userProfileApiService.getProfile().then(profile => {
            this.userProfileApiService.fetchEmails().then(emails => {
                this.newsletterForm.setValue({
                    email: emails[0].email,
                    firstName: profile.first_name,
                    lastName: profile.last_name
                });
            })
        })
    }


    subscribe(){
        // this.userProfileApiService.sendNewsletterConfirmationEmail(this.newsletterForm.value.email);
        this.router.navigate(['issuer']);
        this.openSuccessDialog();
    }

    private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
                text: this.translate.instant('Newsletter.confirmedSubscription'),
				variant: "success"
			},
		});
	}

}