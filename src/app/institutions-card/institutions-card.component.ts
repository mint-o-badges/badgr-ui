import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BadgeClass } from '../issuer/models/badgeclass.model';

export interface Issuer {
	image: string;
	imagePlaceholder: string;
	name: string;
	description: string;
	category: string;
	slug: string;
	badgeClassCount: number;
	learningPathCount: number;
	// Add other properties as needed
}

@Component({
	selector: 'oeb-institutions-card',
	templateUrl: './institutions-card.component.html',
	styleUrls: ['./institutions-card.component.css'],
	host: { class: 'tw-w-[100%] lg:tw-w-[49%]' },
})
export class InstitutionsCardComponent {
	@Input() issuer: Issuer; // Single input for the entire object
	@Input() plural: any; // If needed for pluralization logic
	@Input() public: boolean = true; // If needed for pluralization logic
	@Input() issuerToBadgeInfo: { [issuerId: string]: IssuerBadgesInfo } = {};


	@Output() navigate = new EventEmitter<void>();

	onNavigate() {
		this.navigate.emit();
	}
}


class IssuerBadgesInfo {
	constructor(
		public totalBadgeIssuanceCount = 0,
		public badges: BadgeClass[] = [],
	) { }
}
