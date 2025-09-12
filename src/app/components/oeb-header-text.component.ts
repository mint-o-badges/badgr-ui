import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmH1 } from '@spartan-ng/helm/typography';

/**
 * Standard header component to show double-line header text
 * including styles and offset effect.
 * Supports setting texts via templates, if effects or similar
 * are applied to it.
 * Texts passed to the component are translated by default.
 */
@Component({
	selector: 'oeb-header-text',
	imports: [TranslatePipe, HlmH1, NgTemplateOutlet],
	template: `
		<h1 hlmH1>
			<span class="tw-font-normal tw-text-oebblack tw-break-words">
				@if (text1Template()) {
					<ng-container *ngTemplateOutlet="text1Template()" />
				} @else {
					@if (translate()) {
						{{ text1() | translate }}
					} @else {
						{{ text1() }}
					}
				}
			</span>

			<br />
			<span class="tw-font-black tw-text-purple md:tw-pl-[2ch] tw-break-words">
				@if (text2Template()) {
					<ng-container *ngTemplateOutlet="text2Template()" />
				} @else {
					@if (translate()) {
						{{ text2() | translate }}
					} @else {
						{{ text2() }}
					}
				}
			</span>
		</h1>
	`,
})
export class OebHeaderText {
	/**
	 * Controls whether the component should translate the
	 * texts passed into {@link text1} and {@link text2}.
	 * This option is ignored when templates are passed.
	 */
	translate = input<boolean>(true);

	/**
	 * Upper text of standardized double-line header text.
	 * Displayed in oebblack color and with normal font weight.
	 * Has no effect when {@link text1Template} is used.
	 */
	text1 = input<string>();

	/**
	 * Template to be used for upper text of standardized double-line header text.
	 * Styles are applied to the template, but not translations are applied.
	 * Overrides any usage of {@link text1}.
	 */
	text1Template = input<TemplateRef<any>>();

	/**
	 * Bottom text of standardized double-line header text.
	 * Displayed in oeb purple color and with bold font weight.
	 * Has no effect when {@link text2Template} is used.
	 */
	text2 = input<string>();

	/**
	 * Template to be used for upper text of standardized double-line header text.
	 * Styles are applied to the template, but not translations are applied.
	 * Overrides any usage of {@link text2}.
	 */
	text2Template = input<TemplateRef<any>>();
}
