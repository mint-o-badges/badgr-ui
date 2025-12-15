import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Region } from '../regional-filter/regional-filter.component';

@Component({
	selector: 'app-dashboard-wrapper',
	standalone: true,
	imports: [CommonModule],
	template: '<div></div>',
	styleUrls: ['./dashboard-wrapper.component.scss'],
})
export class DashboardWrapperComponent implements OnInit {
	constructor(private router: Router) {}

	ngOnInit(): void {
		// Check if user has a saved region preference
		const savedRegion = localStorage.getItem('selectedRegion');

		if (savedRegion) {
			try {
				const region: Region = JSON.parse(savedRegion);
				// User has a region selected, redirect to dashboard view
				this.router.navigate(['/dashboard/view']);
			} catch (e) {
				console.error('Error parsing saved region:', e);
				localStorage.removeItem('selectedRegion');
				// Invalid region data, redirect to regional selection
				this.router.navigate(['/dashboard/regional-select']);
			}
		} else {
			// No region selected, redirect to regional selection landing page
			this.router.navigate(['/dashboard/regional-select']);
		}
	}
}
