import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class QueryParametersService {
	constructor(private route: ActivatedRoute) {}

	/**
	 * Looks up a query parameter in the current route, then the current window location query string, and then finally
	 * the initial query string present when the page loaded.
	 *
	 * @param name The name of the param to find
	 * @param checkInitialParams If true, the initial query string params used to load the page will also be checked
	 * @returns {string}
	 */
	queryStringValue(name: string, checkInitialParams = false): string | null {
		// First look in our angular route
		if (this.route.snapshot.params[name]) {
			return decodeURIComponent(this.route.snapshot.params[name]);
		}

		// Look for a query param in the native URL (because you apparently can't get it from angular)
		const regex = new RegExp('[?&]' + name.replace(/[\[\]]/g, '\\$&') + '(=([^&#]*)|&|#|$)');
		let results = regex.exec(window.location.href);
		if (results && results[2]) {
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}

		// And in the initial query string (workaround for https://stackoverflow.com/questions/39898656/angular2-router-keep-query-string)
		if (checkInitialParams) {
			results = regex.exec(window['initialLocationHref']);
			if (results && results[2]) {
				return decodeURIComponent(results[2].replace(/\+/g, ' '));
			}
		}

		return null;
	}

	clearInitialQueryParams() {
		delete window['initialLocationHref'];
	}
}
