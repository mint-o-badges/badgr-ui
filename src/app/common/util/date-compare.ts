/**
 * Compares two Date objects and returns e number value that represents
 * the result:
 * 0 if the two dates are equal.
 * 1 if the first date is greater than second.
 * -1 if the first date is less than second.
 * @param date1 First date object to compare.
 * @param date2 Second date object to compare.
 */
export function compareDate(date1: Date, date2: Date): number {
	// With Date object we can compare dates using the >, <, <= or >=.
	// The ==, !=, ===, and !== operators require date.getTime(),

	// Check if the dates are equal
	const same = date1.getTime() === date2.getTime();
	if (same) return 0;

	// Check if the first is greater than second
	if (date1 > date2) return 1;

	// Check if the first is less than second
	if (date1 < date2) return -1;
}
