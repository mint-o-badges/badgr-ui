import { TranslateService } from '@ngx-translate/core';

export type ExpirationUnit = 'days' | 'weeks' | 'months' | 'years';

export function getDurationOptions(translate: TranslateService): Record<ExpirationUnit, string> {
	return {
		days: translate.instant('General.days'),
		weeks: translate.instant('General.weeks'),
		months: translate.instant('General.months'),
		years: translate.instant('General.years'),
	};
}

export function expirationToDays(amount: number | null, unit: ExpirationUnit | null): number | null {
	if (!amount || amount <= 0 || !unit) return null;

	const MAX_DAYS = 36500; // 100 years

	let days: number;
	switch (unit) {
		case 'days':
			days = amount;
			break;
		case 'weeks':
			days = amount * 7;
			break;
		case 'months':
			days = amount * 30;
			break;
		case 'years':
			days = amount * 365;
			break;
		default:
			return null;
	}

	return days > MAX_DAYS ? null : days;
}
