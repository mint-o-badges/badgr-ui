import { useWebComponentLanguageSetting, createWebcomponent } from 'webcomponents/create-webcomponent';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';

import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { ROUTE_CONFIG } from '~/app.routes';
import { OebBadgeClassEditForm } from './oeb-badgeclass-edit-form.component';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { authTokenInterceptor, TokenAuthService } from '~/common/services/token-auth.service';

createWebcomponent(OebBadgeClassEditForm, 'oeb-badgeclass-edit-form', {
	providers: [
		provideHttpClient(withInterceptors([authTokenInterceptor])),
		importProvidersFrom(BrowserModule, TranslateModule.forRoot()),
		provideAppInitializer(() => {
			const translate = inject(TranslateService);
			translate.setTranslation('en', translationsEn);
			translate.setTranslation('de', translationsDe);

			const lang = inject(LanguageService);
			useWebComponentLanguageSetting(lang);
		}),
		provideRouter(
			ROUTE_CONFIG,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
		),
		{
			provide: AUTH_PROVIDER,
			useClass: TokenAuthService,
		},
	],
});
