import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { provideHttpClient } from '@angular/common/http';
import { Component, importProvidersFrom, inject, input, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';
import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import RecipientLearningPathsOverview from './recipient-learningpaths-overview.component';
import { IconsProvider } from '~/icons-provider';
import { provideRouter, Routes } from '@angular/router';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';

@Component({
	selector: 'oeb-learningpaths-overview',
	imports: [RecipientLearningPathsOverview],
	template: `<div class="oeb page-padding">
		<div class="tw-bg-lightpurple oeb-inset-padding">
			<recipient-learningpaths-overview [learningPaths]="learningPaths()" [isEmbedded]="true" />
		</div>
	</div>`,
})
class OebLearningPathsOverview {
	readonly learningPaths = input<ApiLearningPath[]>([]);
}

createWebcomponent(OebLearningPathsOverview, 'oeb-learningpaths-overview', {
	providers: [
		provideHttpClient(),
		importProvidersFrom(BrowserModule, TranslateModule.forRoot()),
		provideAppInitializer(() => {
			const translate = inject(TranslateService);
			translate.setTranslation('en', translationsEn);
			translate.setTranslation('de', translationsDe);

			const lang = inject(LanguageService);
			useWebComponentLanguageSetting(lang);
		}),
		IconsProvider,
		provideRouter([] as Routes),
	],
});
