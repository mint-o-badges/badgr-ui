import { Component, input, Input } from '@angular/core';

@Component({
	selector: 'oeb-input-error',
	imports: [],
	host: {
		class: 'tw-block tw-mt-0 md:tw-mt-1 tw-min-h-[20px] tw-mb-4',
	},
	template: ` <p class="tw-whitespace-nowrap">{{ error() }}</p> `,
})
export class OebInputErrorComponent {
	public readonly error = input<string>('');
}
