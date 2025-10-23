import { BaseRoutableComponent } from './base-routable.component';
import { OnInit, Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AUTH_PROVIDER } from '../services/authentication-service';

/**
 * Base class for all routable components (pages in the applications) that require authentication.
 */
@Injectable()
export class BaseAuthenticatedRoutableComponent extends BaseRoutableComponent implements OnInit {
	protected router: Router;
	protected route: ActivatedRoute;
	protected sessionService = inject(AUTH_PROVIDER);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route);

		this.router = router;
		this.route = route;
	}

	// eslint-disable-next-line @angular-eslint/contextual-lifecycle
	ngOnInit() {
		if (!this.authService.isLoggedIn) {
			// Do a hard browser redirect to avoid any corrupted state from not being logged in
			window.location.replace(`/auth/login?authError=${encodeURIComponent('Please log in first')}`);

			throw new Error('Not logged in');
		}
	}
}
