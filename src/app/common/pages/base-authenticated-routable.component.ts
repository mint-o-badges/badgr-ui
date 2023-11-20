import {BaseRoutableComponent} from './base-routable.component';
import {OnInit, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionService} from '../services/session.service';

/**
 * Base class for all routable components (pages in the applications) that require authentication.
 */
@Injectable()
export class BaseAuthenticatedRoutableComponent extends BaseRoutableComponent implements OnInit {
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected sessionService: SessionService,
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		if (! this.sessionService.isLoggedIn) {
			// Do a hard browser redirect to avoid any corrupted state from not being logged in
			window.location.replace(`/auth/login?authError=${encodeURIComponent("Please log in first")}`);

			throw new Error("Not logged in");
		}
	}
}
