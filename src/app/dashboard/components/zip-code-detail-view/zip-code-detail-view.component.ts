import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CompetencyTrackingComponent } from '../competency-tracking/competency-tracking.component';
import { ZipCodeStatisticsData, CompetencyBubbleData } from '../../models/dashboard-models';

@Component({
	selector: 'app-zip-code-detail-view',
	standalone: true,
	imports: [CommonModule, TranslatePipe, CompetencyTrackingComponent],
	templateUrl: './zip-code-detail-view.component.html',
	styleUrls: ['./zip-code-detail-view.component.scss']
})
export class ZipCodeDetailViewComponent implements OnInit {
	zipCodeStatistics: ZipCodeStatisticsData[] = [];
	totalLearners: number = 0;
	totalZipCodeAreas: number = 0;
	lastUpdated: string = '';
	competencyBubbleData: CompetencyBubbleData[] = [];
	selectedZipCode: ZipCodeStatisticsData | null = null;
	sortBy: 'zipCode' | 'learnerCount' | 'percentage' | 'trend' = 'learnerCount';
	sortDirection: 'asc' | 'desc' = 'desc';
	loading = false;

	constructor(private router: Router) {}

	ngOnInit(): void {
		this.loading = false;
	}

	viewZipCodePostalCodeDetail(zipCode: string): void {
		this.router.navigate(['/dashboard/postal-code', zipCode]);
	}

	goBack(): void {
		this.router.navigate(['/dashboard/view']);
	}

	setSortBy(field: 'zipCode' | 'learnerCount' | 'percentage' | 'trend'): void {
		if (this.sortBy === field) {
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortBy = field;
			this.sortDirection = field === 'zipCode' ? 'asc' : 'desc';
		}
		this.applySorting();
	}

	private applySorting(): void {
		this.zipCodeStatistics.sort((a, b) => {
			let comparison = 0;

			switch (this.sortBy) {
				case 'zipCode':
					comparison = a.zipCode.localeCompare(b.zipCode);
					break;
				case 'learnerCount':
					comparison = a.learnerCount - b.learnerCount;
					break;
				case 'percentage':
					comparison = a.percentage - b.percentage;
					break;
				case 'trend':
					const trendOrder = { up: 2, stable: 1, down: 0 };
					comparison = trendOrder[a.trend] - trendOrder[b.trend];
					break;
			}

			return this.sortDirection === 'asc' ? comparison : -comparison;
		});
	}

	getTrendIcon(trend: string): string {
		switch (trend) {
			case 'up': return '↗';
			case 'down': return '↘';
			case 'stable': return '→';
			default: return '→';
		}
	}

	getTrendColor(trend: string): string {
		switch (trend) {
			case 'up': return 'var(--color-green)';
			case 'down': return 'var(--color-red)';
			case 'stable': return 'var(--color-darkgray)';
			default: return 'var(--color-darkgray)';
		}
	}

	getSortIcon(field: string): string {
		if (this.sortBy !== field) return '⇅';
		return this.sortDirection === 'asc' ? '↑' : '↓';
	}

	get plzStatistics(): ZipCodeStatisticsData[] {
		return this.zipCodeStatistics;
	}

	get totalPlzAreas(): number {
		return this.totalZipCodeAreas;
	}

	formatDate(dateStr: string): string {
		try {
			const date = new Date(dateStr);
			return date.toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch (e) {
			return dateStr;
		}
	}
}
