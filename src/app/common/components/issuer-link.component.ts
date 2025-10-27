import { Component, ElementRef, Input, OnChanges, inject } from '@angular/core';

import { Issuer } from '../../issuer/models/issuer.model';
import { preloadImageURL } from '../util/file-util';
import { BgImageStatusPlaceholderDirective } from '../directives/bg-image-status-placeholder.directive';

@Component({
	selector: '[bgIssuerLink]',
	host: {
		target: '_blank',
	},
	template: `
		<img
			[loaded-src]="bgIssuerLink?.image"
			[loading-src]="issuerPlaceholderImageSrc"
			[error-src]="issuerPlaceholderImageSrc"
			[alt]="bgIssuerLink ? bgIssuerLink.name + ' avatar' : 'Unknown issuer avatar'"
		/>
		{{ bgIssuerLink?.name || 'Unknown Issuer' }}
	`,
	imports: [BgImageStatusPlaceholderDirective],
})
export class BgIssuerLinkComponent implements OnChanges {
	private elemRef = inject(ElementRef);

	readonly issuerPlaceholderImageSrc = preloadImageURL(
		'../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	@Input()
	bgIssuerLink: Issuer;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	ngOnChanges() {
		if (!this.bgIssuerLink || !this.bgIssuerLink.websiteUrl) {
			this.elem.removeAttribute('href');
		} else {
			this.elem.setAttribute('href', this.bgIssuerLink.websiteUrl);
		}
	}

	get elem(): Element {
		return this.elemRef.nativeElement as Element;
	}
}
