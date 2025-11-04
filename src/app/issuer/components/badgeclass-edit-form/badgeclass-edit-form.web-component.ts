import {
	useWebComponentLanguageSetting,
	createWebcomponent,
	WebComponentRouter,
	WebComponentActivatedRoute,
} from 'webcomponents/create-webcomponent';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageService } from '~/common/services/language.service';

import * as translationsEn from 'src/assets/i18n/en.json';
import * as translationsDe from 'src/assets/i18n/de.json';
import { ActivatedRoute, provideRouter, Router, Routes } from '@angular/router';
import { OebBadgeClassEditForm } from './oeb-badgeclass-edit-form.component';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { authTokenInterceptor, TokenAuthService } from '~/common/services/token-auth.service';
import { IconsProvider } from '~/icons-provider';
import { AppConfigService } from '~/common/app-config.service';

createWebcomponent(OebBadgeClassEditForm, 'oeb-badgeclass-edit-form', {
	providers: [
		provideHttpClient(withInterceptors([authTokenInterceptor])),
		importProvidersFrom(BrowserModule, TranslateModule.forRoot()),
		provideAppInitializer(() => {
			const configService = inject(AppConfigService);

			const translate = inject(TranslateService);
			translate.setTranslation('en', translationsEn);
			translate.setTranslation('de', translationsDe);

			const lang = inject(LanguageService);
			useWebComponentLanguageSetting(lang);

			return configService.initializeConfig();
		}),
		provideRouter([] as Routes),
		{
			provide: Router,
			useClass: WebComponentRouter,
		},
		{
			provide: ActivatedRoute,
			useClass: WebComponentActivatedRoute,
		},
		{
			provide: AUTH_PROVIDER,
			useClass: TokenAuthService,
		},
		IconsProvider,
	],
});
