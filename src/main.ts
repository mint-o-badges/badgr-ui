/// <reference types="@angular/localize" />

import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

// HACK: Workaround how array-uniq v1 checks for features... seems hardcoded for
// node usage. It's needed by sanitize-html.
// TODO: This doesn't work with Angular 9+, find a new hack
//window["global"] = window;

// Store the initial window location to allow for future query param retrieval
// as a workaround for
// https://stackoverflow.com/questions/39898656/angular2-router-keep-query-string
window["initialLocationHref"] = window.location.href.toString();

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.log(err));
