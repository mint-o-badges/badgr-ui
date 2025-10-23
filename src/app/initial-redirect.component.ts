import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from './common/services/session.service';

import '../thirdparty/scopedQuerySelectorShim';

// Shim in support for the :scope attribute
// See https://github.com/lazd/scopedQuerySelectorShim and
// https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children/21126966#21126966

@Component({
	selector: 'initial-redirect',
	template: ``,
})
export class InitialRedirectComponent {
	private sessionService = inject(SessionService);
	private router = inject(Router);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = this.router;

		// if (sessionService.isLoggedIn) {
		// 	router.navigate(['/recipient/badges'], { replaceUrl: true });
		// } else {
		router.navigate(['/public/start'], { replaceUrl: true });
		// }
	}
}
