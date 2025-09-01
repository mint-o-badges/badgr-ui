import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BgImageStatusPlaceholderDirective } from '../../common/directives/bg-image-status-placeholder.directive';
import { TruncatedTextComponent } from '../../common/components/truncated-text.component';
import { HlmBadge } from '../spartan/ui-badge-helm/src/lib/hlm-badge.directive';
import { RouterLink } from '@angular/router';
import { I18nPluralPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { preloadImageURL } from '../../common/util/file-util';
import { HlmH2, HlmP } from '@spartan-ng/helm/typography';

export interface Issuer {
	image: string;
	name: string;
	description: string;
	category: string;
	slug: string;
	badgeClassCount: number;
	learningPathCount: number;
	// Add other properties as needed
}

@Component({
	selector: 'oeb-issuer-card',
	templateUrl: './issuer-card.component.html',
	styleUrls: ['./issuer-card.component.css'],
	imports: [
		BgImageStatusPlaceholderDirective,
		HlmH2,
		TruncatedTextComponent,
		HlmP,
		HlmBadge,
		RouterLink,
		I18nPluralPipe,
		TranslatePipe,
	],
})
export class IssuerCardComponent {
	@Input() issuer: Issuer; // Single input for the entire object
	@Input() plural: any; // If needed for pluralization logic

	@Output() navigate = new EventEmitter<void>();

	readonly issuerImagePlaceHolderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	onNavigate() {
		this.navigate.emit();
	}
}
