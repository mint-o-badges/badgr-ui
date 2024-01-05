import { Component, Input } from '@angular/core';

@Component({
	selector: 'loading-dots',
	template: ` <div
		class="l-flex l-flex-column l-flex-aligncenter l-flex-justifycenter u-margin-top2x {{ className }}"
	>
		<div class="loaderspin loaderspin-large"></div>
		<p class="u-text u-padding-top2x" i18n>Loading...</p>
	</div>`,
})
export class LoadingDotsComponent {
	@Input() className: string;
}
