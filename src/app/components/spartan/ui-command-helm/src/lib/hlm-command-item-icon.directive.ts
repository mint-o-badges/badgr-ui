import { Directive } from '@angular/core';
import { provideHlmIconConfig } from '../../../ui-icon-helm/src/index';

@Directive({
	standalone: true,
	selector: '[hlmCommandIcon]',
	host: {
		class: 'inline-flex mr-2 w-4 h-4',
	},
	providers: [provideHlmIconConfig({ size: 'sm' })],
})
export class HlmCommandIconDirective {}