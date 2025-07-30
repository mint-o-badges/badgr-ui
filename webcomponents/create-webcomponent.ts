import { ApplicationConfig, enableProdMode, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

/**
 * Creates a web component from the given details and registers it with the browser.
 * @param component The Angular component to be wrapped into a web component, e.g. `VersionComponent`
 * @param tagName The tag name under which the web component will be usable, e.g. `oeb-version` (used for customElements.define)
 * @param options ApplicationConfig passed to the web component, used to setup providers and such
 * @returns A promise for creating and registering the web component with the browser
 */
export const createWebcomponent = (component: Type<any>, tagName: string, options: ApplicationConfig) => {
	enableProdMode();

	return createApplication(options)
		.then((app) => {
			const elem = createCustomElement(component, { injector: app.injector });
			customElements.define(tagName, elem);
		})
		.catch((err) => console.error(`Error bootstrapping custom element ${tagName}: ${err}`));
};
