import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Region {
	id: string;
	name: string;
	type: 'kreisfreie-stadt' | 'landkreis';
	plz: string[];
	state: string;
}

@Component({
	selector: 'app-regional-filter',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './regional-filter.component.html',
	styleUrls: ['./regional-filter.component.scss'],
})
export class RegionalFilterComponent implements OnInit {
	selectedRegion: Region | null = null;
	searchTerm: string = '';
	selectedState: string = '';
	selectedType: string = '';

	// Sample regions - in production, this would come from a service
	regions: Region[] = [
		{
			id: '1',
			name: 'Berlin',
			type: 'kreisfreie-stadt',
			plz: ['10115', '10117', '10119', '10178', '10179'],
			state: 'Berlin',
		},
		{
			id: '2',
			name: 'München',
			type: 'kreisfreie-stadt',
			plz: ['80331', '80333', '80335', '80336', '80337'],
			state: 'Bayern',
		},
		{
			id: '3',
			name: 'Hamburg',
			type: 'kreisfreie-stadt',
			plz: ['20095', '20097', '20099', '20144', '20146'],
			state: 'Hamburg',
		},
		// Add more regions as needed
	];

	germanStates: string[] = [
		'Baden-Württemberg',
		'Bayern',
		'Berlin',
		'Brandenburg',
		'Bremen',
		'Hamburg',
		'Hessen',
		'Mecklenburg-Vorpommern',
		'Niedersachsen',
		'Nordrhein-Westfalen',
		'Rheinland-Pfalz',
		'Saarland',
		'Sachsen',
		'Sachsen-Anhalt',
		'Schleswig-Holstein',
		'Thüringen',
	];

	constructor(private router: Router) {}

	ngOnInit(): void {
		// Check if user has a saved region preference
		const savedRegion = localStorage.getItem('selectedRegion');
		if (savedRegion) {
			try {
				this.selectedRegion = JSON.parse(savedRegion);
			} catch (e) {
				console.error('Error parsing saved region:', e);
				localStorage.removeItem('selectedRegion');
			}
		}
	}

	get filteredRegions(): Region[] {
		return this.regions.filter((region) => {
			const matchesSearch =
				!this.searchTerm ||
				region.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				region.plz.some((plz) => plz.includes(this.searchTerm));

			const matchesState = !this.selectedState || region.state === this.selectedState;
			const matchesType = !this.selectedType || region.type === this.selectedType;

			return matchesSearch && matchesState && matchesType;
		});
	}

	selectRegion(region: Region): void {
		this.selectedRegion = region;
		localStorage.setItem('selectedRegion', JSON.stringify(region));
		// Navigate to dashboard view after selecting region
		this.router.navigate(['/dashboard/view']);
	}

	clearSelection(): void {
		this.selectedRegion = null;
		localStorage.removeItem('selectedRegion');
	}

	clearFilters(): void {
		this.searchTerm = '';
		this.selectedState = '';
		this.selectedType = '';
	}
}
