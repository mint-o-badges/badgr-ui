import { createWebcomponent } from 'webcomponents/create-webcomponent';
import { RecipientSkillVisualisationComponent } from './recipient-skill-visualisation.component';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

createWebcomponent(RecipientSkillVisualisationComponent, 'oeb-skill-visualisation', {
	providers: [
		provideHttpClient(),
		importProvidersFrom(
			TranslateModule.forRoot({
				loader: {
					provide: TranslateLoader,
					useFactory: (client) => new TranslateHttpLoader(client),
					deps: [HttpClient],
				},
			}),
		),
	],
});
