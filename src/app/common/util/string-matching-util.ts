export class StringMatchingUtil {
	static stringMatches(toMatch: string, patternStr: string, patternExp: RegExp): boolean {
		toMatch = StringMatchingUtil.normalizeString(toMatch);

		if (toMatch.indexOf(patternStr) >= 0) {
			return true;
		}
		if (patternExp.exec(toMatch)) {
			return true;
		}

		return false;
	}

	static normalizeString(value: string) {
		value = value || '';
		value = value.toLowerCase();
		value = value.trim();
		return value;
	}

	static tryRegExp(pattern: string): RegExp {
		try {
			return RegExp(pattern);
		} catch (e) {
			return null;
		}
	}
}
