/**
 * Adds query string parameters to an existing URL, correctly handling query params and hash values. Does NOT remove
 * existing instances of the params from the URL.
 *
 * @param url The URL to modify
 * @param params A map of param key-value(s) pairs to add.
 * @returns The modified URL
 */
export function addQueryParamsToUrl(url: string, params: { [key: string]: ParamValueType | ParamValueType[] }) {
	const hashIndex = url.indexOf('#');
	const hash = hashIndex < 0 ? null : url.substr(hashIndex);

	if (hash) {
		url = url.substr(0, hashIndex);
	}

	for (const name of Object.getOwnPropertyNames(params)) {
		const values: ParamValueType[] = Array.isArray(params[name])
			? (params[name] as ParamValueType[])
			: [params[name] as ParamValueType];

		for (const value of values) {
			if (url.indexOf('?') >= 0) url += '&';
			else url += '?';

			url += encodeURIComponent(name) + '=' + encodeURIComponent(value.toString());
		}
	}

	if (hash) {
		url += hash;
	}

	return url;
}

/**
 * Like [[addQueryParamsToUrl]], but removes all existing params before adding new ones.
 *
 * @param url
 * @param params
 * @returns {string}
 */
export function replaceUrlQueryParams(url: string, params: { [key: string]: ParamValueType | ParamValueType[] }) {
	return addQueryParamsToUrl(stripQueryParamsFromUrl(url), params);
}

/**
 * Removes query parameters from a URL.
 *
 * @param {string} url
 * @returns {string}
 */
export function stripQueryParamsFromUrl(url: string) {
	const questionIndex = url.indexOf('?');
	const hashIndex = url.indexOf('#');

	if (questionIndex >= 0) {
		return url.substr(0, questionIndex) + (hashIndex >= 0 ? url.substr(hashIndex) : '');
	} else {
		return url;
	}
}

type ParamValueType = string | number | boolean;
