import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';

@Component({
	selector: 'logout',
	template: '',
})
export class LogoutComponent extends BaseRoutableComponent {
	constructor(
		router: Router,
		route: ActivatedRoute,
		protected loginService: SessionService,
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		this.loginService.logout();
        if (this.loginService.isOidcLogin())
            window.location.href = `${this.loginService.baseUrl}/oidcview/logoutRedirect/`
        else
            window.location.replace('/auth');
	}
}
