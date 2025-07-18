import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsPageComponent } from '~/common/components/cms/cms-page.component';

@Component({
	selector: 'app-faq',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'faq' : 'faq'" />`,
	standalone: true,
	imports: [CmsPageComponent],
})
export class FaqComponent {
	constructor(protected translate: TranslateService) {}
}
