import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlzRegion {
	code: string;
	count: number;
	percentage: number;
}

@Component({
	selector: 'app-plz-map',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './plz-map.component.html',
	styleUrls: ['./plz-map.component.scss'],
})
export class PlzMapComponent implements OnInit {
	@Input() plzData: PlzRegion[] = [];

	// Sample PLZ regions with their counts
	plzRegions: PlzRegion[] = [
		{ code: '0', count: 156, percentage: 100 },
		{ code: '1', count: 134, percentage: 86 },
		{ code: '2', count: 98, percentage: 63 },
		{ code: '3', count: 87, percentage: 56 },
		{ code: '4', count: 76, percentage: 49 },
		{ code: '5', count: 65, percentage: 42 },
		{ code: '6', count: 54, percentage: 35 },
		{ code: '7', count: 43, percentage: 28 },
		{ code: '8', count: 32, percentage: 21 },
		{ code: '9', count: 25, percentage: 16 },
	];

	constructor() {}

	ngOnInit(): void {
		if (this.plzData && this.plzData.length > 0) {
			this.plzRegions = this.plzData;
		}
	}

	getColorIntensity(percentage: number): string {
		// Returns a CSS custom property with opacity based on percentage
		const opacity = Math.max(0.2, percentage / 100);
		return `rgba(73, 46, 152, ${opacity})`; // var(--color-purple) with dynamic opacity
	}

	getRegionLabel(code: string): string {
		const labels: { [key: string]: string } = {
			'0': 'Ostdeutschland',
			'1': 'Berlin & Brandenburg',
			'2': 'Hamburg & Schleswig-Holstein',
			'3': 'Niedersachsen',
			'4': 'Nordrhein-Westfalen',
			'5': 'Hessen & Rheinland-Pfalz',
			'6': 'Saarland',
			'7': 'Baden-Württemberg',
			'8': 'Bayern',
			'9': 'Thüringen',
		};
		return labels[code] || `PLZ ${code}xxxx`;
	}
}
