/**
 * Exposes the "debugger" statement as an expression for easier use in closures.
 *
 * Example: `() => debuggerHere() && someOtherFunctionality`
 *
 * @returns {boolean}
 */
export function debuggerHere(): boolean {
	debugger;
	return true;
}
