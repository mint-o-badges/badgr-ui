import { Component } from '@angular/core';
import { HlmSpinnerComponent } from './spartan/ui-spinner-helm/src';

@Component({
	selector: 'oeb-spinner',
	standalone: true,
	imports: [ HlmSpinnerComponent],
	template: `
    <hlm-spinner />
	`,
})
export class OebSpinnerComponent {}
