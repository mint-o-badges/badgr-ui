import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';
import { SessionService } from 'app/common/services/session.service';
import { AuthorizationToken } from 'app/common/services/session.service';
import { OAuthManager } from "app/common/services/oauth-manager.service";
import { UserProfileManager } from 'app/common/services/user-profile-manager.service';
import { ExternalToolsManager } from 'app/externaltools/services/externaltools-manager.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(
    private activeRoute: ActivatedRoute,
    private cookieService: CookieService,
    private sessionService: SessionService,
    private router: Router,
    private oAuthManager: OAuthManager,
	private profileManager: UserProfileManager,
	private externalToolsManager: ExternalToolsManager,
  ) { }


	loggedInSuccess(){
		this.profileManager.reloadUserProfileSet().then(() => {
			this.profileManager.userProfilePromise.then((profile) => {
				if (profile) {
					// fetch user profile and emails to check if they are verified
					profile.emails.updateList().then(() => {
						if (profile.isVerified) {
							if (this.oAuthManager.isAuthorizationInProgress) {
								this.router.navigate(['/auth/oauth2/authorize']);
							} else {
								this.externalToolsManager.externaltoolsList.updateIfLoaded();
								// catch localStorage.redirectUri
								if (localStorage.redirectUri) {
									const redirectUri = new URL(localStorage.redirectUri);
									localStorage.removeItem('redirectUri');
									window.location.replace(redirectUri.origin);
									return false;
								} else {
									// first time only do welcome
									this.router.navigate([
										localStorage.signup ? 'auth/welcome' : 'recipient',
									]);
								}
							}
						} else {
							this.router.navigate([
								'signup/success',
								{ email: profile.emails.entities[0].email },
							]);
						}
					});
				}
			});
		});
	}

  ngOnInit() {
    const queryParams = this.activeRoute.snapshot['queryParams'];
		const is_lms_redirect = queryParams['is-lms-redirect'];
		const secret = queryParams['secret'];
    
		if (queryParams && is_lms_redirect && secret) {
      let token = this.cookieService.get('edx-jwt-cookie-header-payload');
      
      if (token) {
			  token = token + '.' + secret

        this.sessionService.authenticateLMSToken(token).then(response => {
          this.sessionService.storeToken(response as AuthorizationToken)
          this.loggedInSuccess();
          //this.router.navigate(['/public/start']);
        })
      }
		}
  }

}
