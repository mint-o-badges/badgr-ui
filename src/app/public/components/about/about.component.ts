import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsPageComponent } from '~/common/components/cms/cms-page.component';

@Component({
	selector: 'app-about',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'ueber-oeb' : 'about-oeb'" />`,
	standalone: true,
	imports: [CmsPageComponent],
})
export class AboutComponent {
	mailAddress = 'support@openbadges.education';
	mailBody = 'Interesse an Open Educational Badges';
	constructor(public translate: TranslateService) {}
}
