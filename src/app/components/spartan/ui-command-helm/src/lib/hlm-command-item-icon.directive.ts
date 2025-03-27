import { Directive } from '@angular/core';
import { provideHlmIconConfig } from '../../../ui-icon-helm/src/index';

@Directive({
	standalone: true,
	selector: '[hlmCommandIcon]',
	host: {
		class: 'tw-inline-flex tw-mr-2 tw-w-4 tw-h-4',
	},
	providers: [provideHlmIconConfig({ size: 'sm' })],
})
export class HlmCommandIconDirective {}
