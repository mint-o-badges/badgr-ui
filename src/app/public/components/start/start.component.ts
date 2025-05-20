import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-start',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'startseite' : 'startseite'" />`,
	standalone: false,
})
export class StartComponent {
	constructor(
		protected translate: TranslateService
	) {}
}
