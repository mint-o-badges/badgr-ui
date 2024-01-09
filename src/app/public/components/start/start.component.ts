import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';
import { SessionService } from 'app/common/services/session.service';
import { AuthorizationToken } from 'app/common/services/session.service';

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
    private router: Router
  ) { }

  ngOnInit() {
    const queryParams = this.activeRoute.snapshot['queryParams'];
		const is_lms_redirect = queryParams['is-lms-redirect'];
		const secret = queryParams['secret'];
    
		if (queryParams && is_lms_redirect && secret) {
      let token = this.cookieService.get('edx-jwt-cookie-header-payload');
      
      if (token) {
			  token = token + '.' + secret

        this.sessionService.authenticateLMSToken(token).then(response => {
          this.sessionService.storeToken(response as AuthorizationToken, true)
          this.sessionService.loggedInSuccess();
          this.router.navigate(['/public/start']);
        })
      }
		}
  }

}
