import { Directive, Input } from '@angular/core';

const defaultLoadingImage = '../../../breakdown/static/images/image-placeholder.svg';
const defaultErrorImage = '../../../breakdown/static/images/image-failed.svg';

@Directive({
	// Note that to have webpack process these sources, we must add the attributes to webpack.common.js in the html loader section.
	selector: '[click-to-copy]',
	host: {
		'(click)': 'copyInput()',
		'[style.display]': "copySupported ? '' : 'none'",
	},
	exportAs: 'copy-input',
})
export class BgCopyInputDirective {
	@Input('click-to-copy')
	input: HTMLInputElement;

	copySupported(): boolean {
		try {
			return !!document.queryCommandSupported('copy');
		} catch (e) {
			return false;
		}
	}

	copyInput() {
		// Inspired by https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

		const inputWasDisabled = this.input.disabled;
		this.input.disabled = false;
		this.input.select();

		// Invoke browser support
		try {
			if (document.execCommand('copy')) {
				return;
			}
		} catch (err) {
		} finally {
			this.input.disabled = inputWasDisabled;
		}
	}
}
