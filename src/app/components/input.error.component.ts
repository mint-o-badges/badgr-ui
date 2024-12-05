import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HlmInputErrorDirective } from './spartan/ui-input-helm/src';

@Component({
	selector: 'oeb-input-error',
	standalone: true,
	imports: [HlmInputErrorDirective],
	host: {
		class: 'tw-block tw-mt-0 md:tw-mt-1 tw-min-h-[20px] tw-mb-4',
		// eslint-disable-next-line @angular-eslint/no-host-metadata-property
		// '[class.invisible]': "touchedState() === 'UNTOUCHED'",
	},
	template: `
		<p class="tw-whitespace-nowrap">{{ error }}</p>
	`,
})
export class OebInputErrorComponent {
	// private _formField = injectErrorField();
	// public touchedState = this._formField.touchedState;
	// public errors = this._formField.errors;
    @Input() error: string;

	// public errorMessages = computed(() =>
	// 	Object.values(this.errors() ?? {}).map((error) => error.message ?? 'Field invalid'),
	// );
}
