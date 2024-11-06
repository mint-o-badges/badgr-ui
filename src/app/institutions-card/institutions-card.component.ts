import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Issuer {
	image: string;
	imagePlaceholder: string;
	name: string;
	description: string;
	category: string;
	slug: string;
	badgeClassCount: number;
	pathwayCount: number;
	// Add other properties as needed
}

@Component({
	selector: 'app-institutions-card',
	templateUrl: './institutions-card.component.html',
	styleUrls: ['./institutions-card.component.css'],
	host: { style: 'display: contents;' },
})
export class InstitutionsCardComponent {
	@Input() issuer: Issuer; // Single input for the entire object
	@Input() plural: any; // If needed for pluralization logic

	@Output() navigate = new EventEmitter<void>();

	onNavigate() {
		this.navigate.emit();
	}
}
