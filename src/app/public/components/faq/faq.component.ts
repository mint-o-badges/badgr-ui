import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsPageComponent } from '~/common/components/cms/cms-page.component';

@Component({
	selector: 'app-faq',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'faq' : 'faq'" />`,
	standalone: true,
	imports: [CmsPageComponent],
})
export class FaqComponent {
	protected translate = inject(TranslateService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}
}
