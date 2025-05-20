import { Component } from '@angular/core';
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
	constructor(
		private sessionService: SessionService,
		private router: Router,
	) {
		// if (sessionService.isLoggedIn) {
		// 	router.navigate(['/recipient/badges'], { replaceUrl: true });
		// } else {
		router.navigate(['/public/start'], { replaceUrl: true });
		// }
	}
}
