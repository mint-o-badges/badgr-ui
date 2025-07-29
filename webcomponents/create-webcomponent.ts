import { ApplicationConfig, enableProdMode, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

export const createWebcomponent = (component: Type<any>, tagName: string, options: ApplicationConfig) => {
	enableProdMode();

	return createApplication(options)
		.then((app) => {
			const elem = createCustomElement(component, { injector: app.injector });
			customElements.define(tagName, elem);
		})
		.catch((err) => console.error(`Error bootstrapping custom element ${tagName}: ${err}`));
};
