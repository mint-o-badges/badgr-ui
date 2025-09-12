import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmH1 } from '@spartan-ng/helm/typography';

@Component({
	selector: 'oeb-header-text',
	imports: [TranslatePipe, HlmH1],
	template: `
		<h1 hlmH1>
			<span class="tw-font-normal tw-text-oebblack">
				@if (translate()) {
					{{ text1() | translate }}
				} @else {
					{{ text1() }}
				}
			</span>
			<br />
			<span class="tw-font-black tw-text-purple md:tw-pl-[2ch]">
				@if (translate()) {
					{{ text2() | translate }}
				} @else {
					{{ text2() }}
				}
			</span>
		</h1>
	`,
})
export class OebHeaderText {
	/**
	 * Controls whether the component should translate the
	 * texts passed into {@link text1} and {@link text2}
	 */
	translate = input<boolean>(true);

	/**
	 * Upper text of standardized double-line header text.
	 * Displayed in oebblack color and with normal font weight.
	 */
	text1 = input.required<string>();

	/**
	 * Bottom text of standardized double-line header text.
	 * Displayed in oeb purple color and with bold font weight.
	 */
	text2 = input.required<string>();
}
