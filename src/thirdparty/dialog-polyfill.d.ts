declare module 'dialog-polyfill/dialog-polyfill' {
	export function reposition(elem: Element);
	export function isInlinePositionSetByStylesheet(elem: Element);
	export function needsCentering(elem: Element);
	export function forceRegisterDialog(elem: Element);
	export function registerDialog(elem: Element);

	export interface HTMLDialogElement extends HTMLElement {
		showModal();
		show();
		close();
	}
}
