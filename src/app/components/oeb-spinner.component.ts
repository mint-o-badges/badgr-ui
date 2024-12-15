import { Component, Input } from '@angular/core';
import { HlmSpinnerComponent } from './spartan/ui-spinner-helm/src';
import { NgIf } from '@angular/common';

@Component({
    selector: 'oeb-spinner',
    imports: [HlmSpinnerComponent, NgIf],
    template: `
	<div class="tw-flex tw-flex-col tw-items-center tw-w-full">
		<hlm-spinner />
		<span *ngIf="text" class="tw-mt-6 tw-text-oebblack tw-animate-pulse">{{ text }}</span>
	</div>
	`
})
export class OebSpinnerComponent {
	@Input() text: string;
}
