import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PlzMapComponent } from '../plz-map/plz-map.component';
import * as d3 from 'd3';
import { lucideTrophy, lucideMedal, lucideAward } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';

export interface BadgeTypeStats {
	type: 'participation' | 'competency' | 'learningpath';
	label: string;
	count: number;
	percentage: number;
	color: string;
}

export interface BadgeAwardData {
	year: number;
	month: number;
	type: 'participation' | 'competency' | 'learningpath';
	count: number;
	date: Date;
}

export interface Top3Badge {
	rank: 1 | 2 | 3;
	name: string;
	count: number;
	icon?: string;
	color: string;
}

export interface BadgeActivity {
	type: string;
	title: string;
	count: number;
	date: Date;
	icon: string;
}

@Component({
	selector: 'app-badge-analyse',
	standalone: true,
	imports: [CommonModule, FormsModule, PlzMapComponent, NgIcon],
	providers: [provideIcons({ lucideTrophy, lucideMedal, lucideAward })],
	templateUrl: './badge-analyse.component.html',
	styleUrls: ['./badge-analyse.component.scss'],
})
export class BadgeAnalyseComponent implements OnInit, AfterViewInit {
	@ViewChild('lineChartSvg') lineChartSvg!: ElementRef<SVGSVGElement>;
	@ViewChild('chartTooltip') chartTooltip!: ElementRef<HTMLDivElement>;
	@ViewChild('tooltipDate') tooltipDate!: ElementRef<HTMLDivElement>;
	@ViewChild('tooltipContent') tooltipContent!: ElementRef<HTMLDivElement>;

	// Input decorators for data properties
	@Input() badgeTypeStats: BadgeTypeStats[] = [
		{
			type: 'participation',
			label: 'Badge',
			count: 156,
			percentage: 45.6,
			color: '#CCD7FF', // OEB KI Lila NEU
		},
		{
			type: 'competency',
			label: 'Teilnahmezertifikat',
			count: 128,
			percentage: 37.4,
			color: '#FFF6F6', // OEB Rosa (Hintergrund)
		},
		{
			type: 'learningpath',
			label: 'Micro Degrees',
			count: 58,
			percentage: 17.0,
			color: '#FFBAB9', // OEB Mint NEU (Hintergrund)
		},
	];

	// Total badges count
	get totalBadges(): number {
		return this.badgeTypeStats.reduce((sum, stat) => sum + stat.count, 0);
	}

	// Badge count metric
	get badgeCountMetric(): number {
		return this.totalBadges;
	}

	// Badge density metric (spatial)
	@Input() badgeDensity: number = 2.4;
	@Input() badgeDensityTrend: 'up' | 'down' | 'stable' = 'up';
	@Input() badgeDensityTrendValue: number = 8;

	// Badge offering diversity index
	@Input() offeringDiversityIndex: number = 73.2;
	@Input() diversityIndexTrend: 'up' | 'down' | 'stable' = 'up';
	@Input() diversityIndexTrendValue: number = 5;

	// Top 3 Badges (Podium Display)
	@Input() top3Badges: Top3Badge[] = [
		{
			rank: 1,
			name: 'Digital Marketing Expert',
			count: 87,
			icon: 'lucideTrophy',
			color: '#FFCC00', // OEB Gelb (1st place)
		},
		{
			rank: 2,
			name: 'Web Development Fundamentals',
			count: 64,
			icon: 'lucideMedal',
			color: '#492E98', // OEB Blau (2nd place)
		},
		{
			rank: 3,
			name: 'Project Management Professional',
			count: 52,
			icon: 'lucideAward',
			color: '#492E98', // OEB Blau (3rd place)
		},
	];

	// Badge Awards by Year/Month/Type (for line chart)
	@Input() badgeAwardsByTime: BadgeAwardData[] = [
		// 2023 data
		{ year: 2023, month: 1, type: 'competency', count: 8, date: new Date(2023, 0, 1) },
		{ year: 2023, month: 1, type: 'participation', count: 5, date: new Date(2023, 0, 1) },
		{ year: 2023, month: 1, type: 'learningpath', count: 2, date: new Date(2023, 0, 1) },
		{ year: 2023, month: 2, type: 'competency', count: 10, date: new Date(2023, 1, 1) },
		{ year: 2023, month: 2, type: 'participation', count: 7, date: new Date(2023, 1, 1) },
		{ year: 2023, month: 2, type: 'learningpath', count: 3, date: new Date(2023, 1, 1) },
		{ year: 2023, month: 3, type: 'competency', count: 12, date: new Date(2023, 2, 1) },
		{ year: 2023, month: 3, type: 'participation', count: 9, date: new Date(2023, 2, 1) },
		{ year: 2023, month: 3, type: 'learningpath', count: 4, date: new Date(2023, 2, 1) },
		{ year: 2023, month: 4, type: 'competency', count: 14, date: new Date(2023, 3, 1) },
		{ year: 2023, month: 4, type: 'participation', count: 11, date: new Date(2023, 3, 1) },
		{ year: 2023, month: 4, type: 'learningpath', count: 5, date: new Date(2023, 3, 1) },
		{ year: 2023, month: 5, type: 'competency', count: 16, date: new Date(2023, 4, 1) },
		{ year: 2023, month: 5, type: 'participation', count: 13, date: new Date(2023, 4, 1) },
		{ year: 2023, month: 5, type: 'learningpath', count: 6, date: new Date(2023, 4, 1) },
		{ year: 2023, month: 6, type: 'competency', count: 18, date: new Date(2023, 5, 1) },
		{ year: 2023, month: 6, type: 'participation', count: 15, date: new Date(2023, 5, 1) },
		{ year: 2023, month: 6, type: 'learningpath', count: 7, date: new Date(2023, 5, 1) },
		{ year: 2023, month: 7, type: 'competency', count: 20, date: new Date(2023, 6, 1) },
		{ year: 2023, month: 7, type: 'participation', count: 16, date: new Date(2023, 6, 1) },
		{ year: 2023, month: 7, type: 'learningpath', count: 7, date: new Date(2023, 6, 1) },
		{ year: 2023, month: 8, type: 'competency', count: 19, date: new Date(2023, 7, 1) },
		{ year: 2023, month: 8, type: 'participation', count: 15, date: new Date(2023, 7, 1) },
		{ year: 2023, month: 8, type: 'learningpath', count: 8, date: new Date(2023, 7, 1) },
		{ year: 2023, month: 9, type: 'competency', count: 22, date: new Date(2023, 8, 1) },
		{ year: 2023, month: 9, type: 'participation', count: 17, date: new Date(2023, 8, 1) },
		{ year: 2023, month: 9, type: 'learningpath', count: 9, date: new Date(2023, 8, 1) },
		{ year: 2023, month: 10, type: 'competency', count: 24, date: new Date(2023, 9, 1) },
		{ year: 2023, month: 10, type: 'participation', count: 19, date: new Date(2023, 9, 1) },
		{ year: 2023, month: 10, type: 'learningpath', count: 10, date: new Date(2023, 9, 1) },
		{ year: 2023, month: 11, type: 'competency', count: 23, date: new Date(2023, 10, 1) },
		{ year: 2023, month: 11, type: 'participation', count: 18, date: new Date(2023, 10, 1) },
		{ year: 2023, month: 11, type: 'learningpath', count: 9, date: new Date(2023, 10, 1) },
		{ year: 2023, month: 12, type: 'competency', count: 21, date: new Date(2023, 11, 1) },
		{ year: 2023, month: 12, type: 'participation', count: 17, date: new Date(2023, 11, 1) },
		{ year: 2023, month: 12, type: 'learningpath', count: 8, date: new Date(2023, 11, 1) },

		// 2024 data
		{ year: 2024, month: 1, type: 'competency', count: 12, date: new Date(2024, 0, 1) },
		{ year: 2024, month: 1, type: 'participation', count: 8, date: new Date(2024, 0, 1) },
		{ year: 2024, month: 1, type: 'learningpath', count: 4, date: new Date(2024, 0, 1) },
		{ year: 2024, month: 2, type: 'competency', count: 15, date: new Date(2024, 1, 1) },
		{ year: 2024, month: 2, type: 'participation', count: 11, date: new Date(2024, 1, 1) },
		{ year: 2024, month: 2, type: 'learningpath', count: 5, date: new Date(2024, 1, 1) },
		{ year: 2024, month: 3, type: 'competency', count: 18, date: new Date(2024, 2, 1) },
		{ year: 2024, month: 3, type: 'participation', count: 14, date: new Date(2024, 2, 1) },
		{ year: 2024, month: 3, type: 'learningpath', count: 6, date: new Date(2024, 2, 1) },
		{ year: 2024, month: 4, type: 'competency', count: 21, date: new Date(2024, 3, 1) },
		{ year: 2024, month: 4, type: 'participation', count: 16, date: new Date(2024, 3, 1) },
		{ year: 2024, month: 4, type: 'learningpath', count: 7, date: new Date(2024, 3, 1) },
		{ year: 2024, month: 5, type: 'competency', count: 24, date: new Date(2024, 4, 1) },
		{ year: 2024, month: 5, type: 'participation', count: 19, date: new Date(2024, 4, 1) },
		{ year: 2024, month: 5, type: 'learningpath', count: 8, date: new Date(2024, 4, 1) },
		{ year: 2024, month: 6, type: 'competency', count: 27, date: new Date(2024, 5, 1) },
		{ year: 2024, month: 6, type: 'participation', count: 22, date: new Date(2024, 5, 1) },
		{ year: 2024, month: 6, type: 'learningpath', count: 9, date: new Date(2024, 5, 1) },
		{ year: 2024, month: 7, type: 'competency', count: 29, date: new Date(2024, 6, 1) },
		{ year: 2024, month: 7, type: 'participation', count: 24, date: new Date(2024, 6, 1) },
		{ year: 2024, month: 7, type: 'learningpath', count: 10, date: new Date(2024, 6, 1) },
		{ year: 2024, month: 8, type: 'competency', count: 26, date: new Date(2024, 7, 1) },
		{ year: 2024, month: 8, type: 'participation', count: 21, date: new Date(2024, 7, 1) },
		{ year: 2024, month: 8, type: 'learningpath', count: 11, date: new Date(2024, 7, 1) },
		{ year: 2024, month: 9, type: 'competency', count: 30, date: new Date(2024, 8, 1) },
		{ year: 2024, month: 9, type: 'participation', count: 25, date: new Date(2024, 8, 1) },
		{ year: 2024, month: 9, type: 'learningpath', count: 12, date: new Date(2024, 8, 1) },
		{ year: 2024, month: 10, type: 'competency', count: 32, date: new Date(2024, 9, 1) },
		{ year: 2024, month: 10, type: 'participation', count: 27, date: new Date(2024, 9, 1) },
		{ year: 2024, month: 10, type: 'learningpath', count: 13, date: new Date(2024, 9, 1) },
		{ year: 2024, month: 11, type: 'competency', count: 31, date: new Date(2024, 10, 1) },
		{ year: 2024, month: 11, type: 'participation', count: 26, date: new Date(2024, 10, 1) },
		{ year: 2024, month: 11, type: 'learningpath', count: 12, date: new Date(2024, 10, 1) },
		{ year: 2024, month: 12, type: 'competency', count: 28, date: new Date(2024, 11, 1) },
		{ year: 2024, month: 12, type: 'participation', count: 23, date: new Date(2024, 11, 1) },
		{ year: 2024, month: 12, type: 'learningpath', count: 11, date: new Date(2024, 11, 1) },

		// 2025 data (partial year)
		{ year: 2025, month: 1, type: 'competency', count: 14, date: new Date(2025, 0, 1) },
		{ year: 2025, month: 1, type: 'participation', count: 10, date: new Date(2025, 0, 1) },
		{ year: 2025, month: 1, type: 'learningpath', count: 5, date: new Date(2025, 0, 1) },
		{ year: 2025, month: 2, type: 'competency', count: 17, date: new Date(2025, 1, 1) },
		{ year: 2025, month: 2, type: 'participation', count: 13, date: new Date(2025, 1, 1) },
		{ year: 2025, month: 2, type: 'learningpath', count: 6, date: new Date(2025, 1, 1) },
		{ year: 2025, month: 3, type: 'competency', count: 20, date: new Date(2025, 2, 1) },
		{ year: 2025, month: 3, type: 'participation', count: 16, date: new Date(2025, 2, 1) },
		{ year: 2025, month: 3, type: 'learningpath', count: 7, date: new Date(2025, 2, 1) },
	];

	// Filter state for line chart
	selectedYear: number = 2024;
	selectedMonth: number | null = null;
	selectedBadgeType: string = 'all';

	availableYears: number[] = [2023, 2024, 2025];
	availableMonths: { value: number; label: string }[] = [
		{ value: 1, label: 'Januar' },
		{ value: 2, label: 'Februar' },
		{ value: 3, label: 'März' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'Mai' },
		{ value: 6, label: 'Juni' },
		{ value: 7, label: 'Juli' },
		{ value: 8, label: 'August' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'Oktober' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'Dezember' },
	];

	badgeTypes: { value: string; label: string }[] = [
		{ value: 'all', label: 'Alle Typen' },
		{ value: 'competency', label: 'Teilnahmezertifikat' },
		{ value: 'participation', label: 'Badge' },
		{ value: 'learningpath', label: 'Micro Degrees' },
	];

	// Recent badge activities
	@Input() recentActivities: BadgeActivity[] = [];

	constructor() {}

	ngOnInit(): void {
		// Component initialization logic
	}

	ngAfterViewInit(): void {
		// Render line chart after view initialization
		setTimeout(() => {
			this.renderLineChart();
		}, 0);
	}

	// Filter methods for line chart
	onYearChange(year: number): void {
		this.selectedYear = year;
		this.renderLineChart();
	}

	onMonthChange(month: number | null): void {
		this.selectedMonth = month;
		this.renderLineChart();
	}

	onBadgeTypeChange(type: string): void {
		this.selectedBadgeType = type;
		this.renderLineChart();
	}

	// Get filtered badge award data
	getFilteredBadgeAwards(): BadgeAwardData[] {
		return this.badgeAwardsByTime.filter((award) => {
			const yearMatch = award.year === this.selectedYear;
			const monthMatch = this.selectedMonth === null || award.month === this.selectedMonth;
			const typeMatch = this.selectedBadgeType === 'all' || award.type === this.selectedBadgeType;
			return yearMatch && monthMatch && typeMatch;
		});
	}

	// Get podium position class for Top 3 display
	getPodiumClass(rank: number): string {
		switch (rank) {
			case 1:
				return 'tw-order-2 tw-h-64'; // Gold (center, tallest)
			case 2:
				return 'tw-order-1 tw-h-56'; // Silver (left, medium)
			case 3:
				return 'tw-order-3 tw-h-48'; // Bronze (right, shortest)
			default:
				return '';
		}
	}

	// Get podium label position
	getPodiumLabelClass(rank: number): string {
		switch (rank) {
			case 1:
				return 'tw-mb-6';
			case 2:
				return 'tw-mb-4';
			case 3:
				return 'tw-mb-2';
			default:
				return '';
		}
	}

	getTrendIcon(trend: string): string {
		switch (trend) {
			case 'up':
				return 'lucideTrendingUp';
			case 'down':
				return 'lucideTrendingDown';
			case 'stable':
				return 'lucideMinus';
			default:
				return 'lucideMinus';
		}
	}

	getTrendColor(trend: string): string {
		switch (trend) {
			case 'up':
				return 'text-green-500';
			case 'down':
				return 'text-red-500';
			case 'stable':
				return 'text-gray-500';
			default:
				return 'text-gray-500';
		}
	}

	formatDate(date: Date): string {
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}

	getActivityIcon(type: string): string {
		switch (type) {
			case 'badge':
				return 'lucideAward';
			default:
				return 'lucideInfo';
		}
	}

	getActivityColor(type: string): string {
		switch (type) {
			case 'badge':
				return 'text-yellow-600';
			default:
				return 'text-gray-600';
		}
	}

	// Calculate bar width percentage relative to the highest count
	getBarWidthPercentage(count: number): number {
		const maxCount = Math.max(...this.top3Badges.map((b) => b.count));
		return Math.round((count / maxCount) * 100);
	}

	// Render line chart using D3
	renderLineChart(): void {
		if (!this.lineChartSvg) return;

		const svg = d3.select(this.lineChartSvg.nativeElement);
		svg.selectAll('*').remove(); // Clear previous chart

		const container = this.lineChartSvg.nativeElement.parentElement;
		if (!container) return;

		const margin = { top: 20, right: 30, bottom: 50, left: 50 };
		const width = container.clientWidth - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		// Get filtered data
		const filteredData = this.getFilteredBadgeAwards();

		if (filteredData.length === 0) {
			// Show "No data" message
			svg.append('text')
				.attr('x', width / 2 + margin.left)
				.attr('y', height / 2 + margin.top)
				.attr('text-anchor', 'middle')
				.attr('fill', '#6B7280')
				.style('font-size', '16px')
				.text('Keine Daten verfügbar');
			return;
		}

		// Group data by month for line chart
		const monthlyData = d3.group(filteredData, (d) => d.month);
		const chartData = Array.from(monthlyData, ([month, items]) => ({
			month,
			competency: items.find((i) => i.type === 'competency')?.count || 0,
			participation: items.find((i) => i.type === 'participation')?.count || 0,
			learningpath: items.find((i) => i.type === 'learningpath')?.count || 0,
			total: items.reduce((sum, i) => sum + i.count, 0),
		})).sort((a, b) => a.month - b.month);

		// Create scales
		const xScale = d3.scaleLinear().domain([1, 12]).range([0, width]);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(chartData, (d) => Math.max(d.competency, d.participation, d.learningpath)) || 30])
			.nice()
			.range([height, 0]);

		// Create chart group
		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// Add grid lines
		g.append('g')
			.attr('class', 'grid')
			.attr('opacity', 0.1)
			.call(
				d3
					.axisLeft(yScale)
					.tickSize(-width)
					.tickFormat(() => ''),
			);

		// Add axes
		g.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(
				d3
					.axisBottom(xScale)
					.ticks(12)
					.tickFormat((d) => this.availableMonths[+d - 1]?.label || ''),
			)
			.selectAll('text')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end')
			.style('font-size', '12px');

		g.append('g').call(d3.axisLeft(yScale)).style('font-size', '12px');

		// Define line generators
		const lineGenerators: { type: string; color: string; line: d3.Line<any> }[] = [
			{
				type: 'competency',
				color: '#492E98', // OEB Blau
				line: d3
					.line<any>()
					.x((d) => xScale(d.month))
					.y((d) => yScale(d.competency))
					.curve(d3.curveMonotoneX),
			},
			{
				type: 'participation',
				color: '#CCD7FF', // OEB KI Lila NEU
				line: d3
					.line<any>()
					.x((d) => xScale(d.month))
					.y((d) => yScale(d.participation))
					.curve(d3.curveMonotoneX),
			},
			{
				type: 'learningpath',
				color: '#93F993', // OEB Grün
				line: d3
					.line<any>()
					.x((d) => xScale(d.month))
					.y((d) => yScale(d.learningpath))
					.curve(d3.curveMonotoneX),
			},
		];

		// Draw lines based on selected badge type
		lineGenerators.forEach(({ type, color, line }) => {
			if (this.selectedBadgeType === 'all' || this.selectedBadgeType === type) {
				// Draw line
				g.append('path')
					.datum(chartData)
					.attr('fill', 'none')
					.attr('stroke', color)
					.attr('stroke-width', 3)
					.attr('d', line)
					.style('opacity', 0.8);

				// Draw points
				g.selectAll(`.dot-${type}`)
					.data(chartData)
					.enter()
					.append('circle')
					.attr('class', `dot-${type}`)
					.attr('cx', (d) => xScale(d.month))
					.attr('cy', (d) => yScale((d as any)[type]))
					.attr('r', 5)
					.attr('fill', color)
					.attr('stroke', 'white')
					.attr('stroke-width', 2)
					.style('cursor', 'pointer')
					.on('mouseover', (event, d) => this.showTooltipForChart(event, d, type))
					.on('mouseout', () => this.hideTooltipForChart());
			}
		});
	}

	// Show tooltip on hover
	showTooltipForChart(event: any, data: any, type: string): void {
		if (!this.chartTooltip || !this.tooltipDate || !this.tooltipContent) return;

		const monthLabel = this.availableMonths[data.month - 1]?.label || '';
		const typeLabel = this.badgeTypes.find((t) => t.value === type)?.label || '';
		const count = (data as any)[type];

		this.tooltipDate.nativeElement.textContent = `${monthLabel} ${this.selectedYear}`;
		this.tooltipContent.nativeElement.textContent = `${typeLabel}: ${count} Badges`;

		const tooltip = this.chartTooltip.nativeElement;
		tooltip.classList.remove('tw-hidden');

		// Position tooltip near mouse
		const container = this.lineChartSvg.nativeElement.parentElement;
		if (container) {
			const rect = container.getBoundingClientRect();
			tooltip.style.left = `${event.pageX - rect.left + 10}px`;
			tooltip.style.top = `${event.pageY - rect.top - 40}px`;
		}
	}

	// Hide tooltip
	hideTooltipForChart(): void {
		if (!this.chartTooltip) return;
		this.chartTooltip.nativeElement.classList.add('tw-hidden');
	}
}
