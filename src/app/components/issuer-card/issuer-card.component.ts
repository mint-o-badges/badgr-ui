import { Component, Input, Output, EventEmitter } from '@angular/core';
import { preloadImageURL } from '../../common/util/file-util';

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
	standalone: false,
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
