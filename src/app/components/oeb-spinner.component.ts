import { Component, Input } from '@angular/core';
import { HlmSpinner, SpinnerVariants } from './spartan/ui-spinner-helm/src';

@Component({
	selector: 'oeb-spinner',
	imports: [HlmSpinner],
	template: `
		<div class="tw-flex tw-flex-col tw-items-center tw-w-full">
			<hlm-spinner [size]="size" />
			@if (text) {
				<span class="tw-mt-6 tw-text-oebblack tw-animate-pulse">{{ text }}</span>
			}
		</div>
	`,
})
export class OebSpinnerComponent {
	@Input() text: string;
	@Input() size: SpinnerVariants['size'];
	@Input() variant: SpinnerVariants['variant'];
}
