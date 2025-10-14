import { ApplicationConfig, enableProdMode, Injectable, signal, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { LanguageService, lngs } from '~/common/services/language.service';

/**
 * Creates a web component from the given details and registers it with the browser.
 * @param component The Angular component to be wrapped into a web component, e.g. `VersionComponent`
 * @param tagName The tag name under which the web component will be usable, e.g. `oeb-version` (used for customElements.define)
 * @param options ApplicationConfig passed to the web component, used to setup providers and such
 * @returns A promise for creating and registering the web component with the browser
 */
export const createWebcomponent = (component: Type<unknown>, tagName: string, options: ApplicationConfig) => {
	enableProdMode();

	return createApplication(options)
		.then((app) => {
			const elem = createCustomElement(component, { injector: app.injector });
			customElements.define(tagName, elem);
		})
		.catch((err) => console.error(`Error bootstrapping custom element ${tagName}: ${err}`));
};

/**
 * A reusable configuration method to make a web component aware of the language setting
 * that is set in a configuration object of the embedding window.
 * @param lang The language service configured in the app initializer
 */
export const useWebComponentLanguageSetting = (lang: LanguageService) => {
	if (!window || !window['OEBWebComponentSettings'] || !window['OEBWebComponentSettings'].language) return;
	const configuredLanguage = window['OEBWebComponentSettings'].language as string;
	if (lngs.indexOf(configuredLanguage) >= 0) lang.setLanguage(configuredLanguage);
	else lang.setInitialAppLanguage();
};

@Injectable()
export class WebComponentRouter extends Router {
	navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
		return super.navigate(commands, extras);
	}
}
