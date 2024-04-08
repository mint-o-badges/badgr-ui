// tslint:disable

// From https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
export function isPositiveInteger(n) {
	return n >>> 0 === parseFloat(n);
}

/**
 * Generates
 *
 * @param o
 * @returns {string}
 */
export function toJsonInclArrayProps(o) {
	// Uncomment to respect custom toJSON functions
	// if (typeof(o) === "object" && typeof[o["toJSON"]] === "function") {
	// 	o = o.toJSON();
	// }

	if (Array.isArray(o)) {
		const indexedProps = [];
		const namedProps = [];

		for (const key in o) {
			if (o.hasOwnProperty(key)) {
				if (isPositiveInteger(key)) {
					indexedProps[key] = toJsonInclArrayProps(o[key]);
				} else {
					namedProps.push(`${key}: ${toJsonInclArrayProps(o[key])}`);
				}
			}
		}

		return '[ ' + indexedProps.concat(namedProps).join(', ') + ' ]';
	} else if (typeof o === 'object') {
		const namedProps = [];

		for (const key in o) {
			if (o.hasOwnProperty(key)) {
				namedProps.push(`${key}: ${toJsonInclArrayProps(o[key])}`);
			}
		}

		return '{ ' + namedProps.join(', ') + ' }';
	} else if (typeof o === 'string') {
		return '"' + o.replace(/([\t\n\r"'])/g, '\\$1') + '"';
	} else {
		return '' + o;
	}
}

export function jsonCopy<T>(x: T): T {
	return JSON.parse(JSON.stringify(x));
}

/**
 * Copies the properties from a source object into a dest object. Does so recursively, unlike Object.assign. In addition,
 * a best-attempt effort is taken not to mutate the destination object tree. If a property already exists with the correct
 * type or value, it is maintained.
 *
 * @param dest
 * @param source
 * @param seenSources
 * @returns {any}
 */
export function deepAssign(dest: any, source: any, seenSources: Set<any> = new Set<any>()): any {
	if (seenSources.has(source)) {
		throw new Error('Recursive source object graph given to deepAssign');
	} else {
		seenSources.add(source);
	}

	// Handle removed values
	if (Array.isArray(dest)) {
		const sourceArray = Array.isArray(source) ? source : Object.assign([], source);
		dest.length = sourceArray.length;

		for (const key in dest) {
			if (!isPositiveInteger(key) && dest.hasOwnProperty(key) && !source.hasOwnProperty(key)) {
				delete dest[key];
			}
		}
	} else {
		for (const key in dest) {
			if (dest.hasOwnProperty(key) && !source.hasOwnProperty(key)) {
				delete dest[key];
			}
		}
	}

	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			const s = source[key];
			const d = dest[key];

			const sType = Array.isArray(s) ? 'array' : typeof s;
			const dType = Array.isArray(d) ? 'array' : typeof d;

			if (sType === 'object' || sType === 'array') {
				// Handle preexisting objects in the dest
				if (dType === 'object' || dType === 'array') {
					if (dType !== sType) {
						// Handle array -> object and object -> array changes by copying data
						if (sType === 'array') {
							dest[key] = [];
						} else {
							dest[key] = {};
						}

						for (const dKey in d) {
							if (d.hasOwnProperty(dKey)) {
								dest[key][dKey] = d[dKey];
							}
						}
					}

					deepAssign(dest[key], s, seenSources);
				} else {
					dest[key] = JSON.parse(JSON.stringify(s));
				}
			} else {
				dest[key] = s;
			}
		}
	}

	return dest;
}
// tslint:enable
