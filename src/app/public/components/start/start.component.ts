import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsPageComponent } from '~/common/components/cms/cms-page.component';

@Component({
	selector: 'app-start',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'startseite' : 'homepage'" />`,
	standalone: true,
	imports: [CmsPageComponent],
})
export class StartComponent {
	constructor(protected translate: TranslateService) {}
}
