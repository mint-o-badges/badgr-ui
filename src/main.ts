import { enableProdMode, importProvidersFrom, provideAppInitializer, inject } from '@angular/core';

import { environment } from './environments/environment';
import { RecipientBadgeApiService } from './app/recipient/services/recipient-badges-api.service';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { BadgrRouteReuseStrategy } from './app/common/util/route-reuse-strategy';
import { AppConfigService } from './app/common/app-config.service';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { initializeTheme } from './theming/theme-setup';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ROUTE_CONFIG } from './app/app.routes';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

// Store the initial window location to allow for future query param retrieval
// as a workaround for
// https://stackoverflow.com/questions/39898656/angular2-router-keep-query-string
window['initialLocationHref'] = window.location.href.toString();

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, {
	providers: [
		provideHttpClient(),
		importProvidersFrom(
			BrowserModule,
			TranslateModule.forRoot({
				loader: {
					provide: TranslateLoader,
					useFactory: (client) => new TranslateHttpLoader(client),
					deps: [HttpClient],
				},
			}),
		),
		RecipientBadgeApiService,
		{ provide: RouteReuseStrategy, useClass: BadgrRouteReuseStrategy },
		provideAppInitializer(async () => {
			const configService = inject(AppConfigService);
			const configPromise = configService.initializeConfig();

			// Expose the configuration to external scripts for debugging and testing.
			window['badgrConfigPromise'] = configPromise;

			const config = await configPromise;

			window['badgrConfig'] = config;

			initializeTheme(configService);
		}),
		provideRouter(ROUTE_CONFIG),
		provideAnimations(),
	],
}).catch((err) => console.log(err));
