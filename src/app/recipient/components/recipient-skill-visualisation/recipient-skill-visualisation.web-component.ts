import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { RecipientSkillVisualisationComponent } from './recipient-skill-visualisation.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';

import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';

/**
 * To use this component, main.js, polyfills.js and styles.css need to be imported.
 * Then use javascript to set the input of the component:
 *
 * <html>
 * 	<head>
 * 		...
 * 		<link rel="stylesheet" href="{{URLOfHostingServer}}/styles.css" />
 *      <script>
 *          window.OEBWebComponentSettings = {
 *            language: 'en'
 *          };
 *      </script>
 * 	</head>
 * 	<body>
 *
 * 		<oeb-skill-visualisation id='skills'></oeb-skill-visualisation>
 *
 * 		<script src="polyfills.js" type="module"></script>
 * 		<script src="main.js" type="module"></script>
 * 		<script type="text/javascript">
 * 			document.addEventListener("DOMContentLoaded", () => {
 * 				const skills = [...];
 * 				document.getElementById("skills").skills = skills;
 * 			});
 * 		</script>
 * 	</boody>
 * </html>
 */
createWebcomponent(RecipientSkillVisualisationComponent, 'oeb-skill-visualisation', {
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
	],
});
