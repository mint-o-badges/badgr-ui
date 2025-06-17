import { Component, Input } from '@angular/core';

@Component({
	selector: 'loading-error',
	host: {
		class: 'loadingerror {{className}}',
	},
	template: `
		<article class="l-containerxaxis l-containeryaxis">
			<div class="l-flex l-flex-column l-flex-justifycenter l-flex-aligncenter">
				<h1 class="u-text-h3 u-margin-bottom2x tw-text-purple">{{ errorMessage }}</h1>
				<img class="u-width-form" [src]="unavailableImageSrc" />
			</div>
		</article>
	`,
})
export class LoadingErrorComponent {
	@Input() errorMessage: string;
	@Input() className: string;

	readonly unavailableImageSrc = '../../../assets/@concentricsky/badgr-style/dist/images/image-error.svg';
}
