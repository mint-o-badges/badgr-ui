import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlzMapComponent } from '../plz-map/plz-map.component';
import * as d3 from 'd3';

// ===========================
// INTERFACES
// ===========================

export interface KPIData {
	label: string;
	value: number | string;
	unit?: string;
	trend?: 'up' | 'down' | 'stable';
	trendValue?: number;
	trendLabel?: string;
	icon?: string;
	color?: string;
	tooltip?: string;
}

export interface ChartData {
	labels: string[];
	values: number[];
	backgroundColor?: string[];
}

export interface CompetencyBubbleData {
	name: string;
	value: number;
	weight: number;
	color: string;
	icon?: string; // Icon identifier for the competency
}

export interface CompetencyData {
	competency: string;
	count: number;
	hours: number;
	color: string;
}

export interface SunRay {
	x1: string;
	y1: string;
	x2: string;
	y2: string;
	startWidth: number; // Width at center
	endWidth: number; // Width at edge
	delay: string;
}

@Component({
	selector: 'app-kompetenzen-tracking',
	standalone: true,
	imports: [CommonModule, FormsModule, PlzMapComponent],
	templateUrl: './kompetenzen-tracking.component.html',
	styleUrls: ['./kompetenzen-tracking.component.scss'],
})
export class KompetenzenTrackingComponent implements OnInit, AfterViewInit {
	@ViewChild('bubbleChartSvg') bubbleChartSvg!: ElementRef<SVGSVGElement>;
	@ViewChild('bubbleTooltip') bubbleTooltip!: ElementRef<HTMLDivElement>;

	// Sun ray decorations - no longer needed with CSS suns
	// sunRaysLarge: SunRay[] = [];
	// sunRaysSmall: SunRay[] = [];

	// ===========================
	// COMPETENCY KPIs
	// ===========================

	@Input() competencyKpis: KPIData[] = [
		{
			label: 'Kompetenzstunden insgesamt',
			value: 1247,
			unit: 'Stunden',
			trend: 'up',
			trendValue: 95,
			trendLabel: '+95 im letzten Monat',
			icon: 'lucideBookOpen',
			color: 'text-purple-600',
			tooltip: 'Anzahl der Kompetenz in Stunden, welche die Badges insgesamt erhalten',
		},
		{
			label: 'Kompetenzstunden je Kompetenzen',
			value: 9.8,
			unit: 'Stunden/Kompetenz',
			trend: 'up',
			trendValue: 12,
			trendLabel: '+12 im letzten Monat',
			icon: 'lucideBookOpen',
			color: 'text-green-600',
		},
		{
			label: 'Neu eingebrachte Kompetenzen',
			value: 42,
			unit: 'neue Felder',
			trend: 'up',
			trendValue: 7,
			trendLabel: '+7 im letzten Monat',
			icon: 'lucidePlus',
			color: 'text-cyan-600',
		},
		{
			label: 'Kompetenzportfolio-Breite (PLZ)',
			value: 85,
			unit: 'PLZ-Bereiche',
			trend: 'stable',
			trendValue: 2,
			trendLabel: '+2 im letzten Monat',
			icon: 'lucideMapPin',
			color: 'text-purple-600',
		},
	];

	// ===========================
	// COMPETENCY DISTRIBUTION
	// ===========================

	@Input() escoCompetencyData: ChartData = {
		labels: ['IT & Digital', 'Soziale Kompetenzen', 'Sprachen', 'Handwerk', 'Management', 'Andere'],
		values: [28.5, 22.1, 18.3, 12.7, 10.8, 7.6],
		backgroundColor: ['#492E98', '#492E98', '#93F993', '#CCD7FF', '#E4FFE4', '#757575'], // OEB Blau (dominant), OEB Blau, Grün, KI Lila, Mint, Dark Grey
	};

	// ===========================
	// COMPETENCY BUBBLE CHART DATA
	// ===========================

	@Input() competencyBubbleData: CompetencyBubbleData[] = [
		{ name: 'IT & Digital', value: 28.5, weight: 285, color: '#492E98', icon: 'Monitor' }, // OEB Blau
		{ name: 'Soziale Kompetenzen', value: 22.1, weight: 221, color: '#492E98', icon: 'Users' }, // OEB Blau
		{ name: 'Sprachen', value: 18.3, weight: 183, color: '#492E98', icon: 'Globe' }, // OEB Blau
		{ name: 'Handwerk', value: 12.7, weight: 127, color: '#492E98', icon: 'Wrench' }, // OEB Blau
		{ name: 'Management', value: 10.8, weight: 108, color: '#492E98', icon: 'BarChart3' }, // OEB Blau
		{ name: 'Andere', value: 7.6, weight: 76, color: '#492E98', icon: 'Star' }, // OEB Blau
	];

	// ===========================
	// GENDER DISTRIBUTION OF COMPETENCIES
	// ===========================

	@Input() genderCompetencyData: ChartData = {
		labels: ['Männlich', 'Weiblich', 'Divers', 'Keine Angabe'],
		values: [42.3, 38.7, 2.8, 16.2],
		backgroundColor: ['#492E98', '#492E98', '#CCD7FF', '#757575'], // OEB Blau (dominant), OEB Blau, KI Lila, Dark Grey
	};

	// ===========================
	// INDIVIDUAL COMPETENCY RANKINGS (Horizontal Bar Chart)
	// ===========================

	@Input() individualCompetencyData: CompetencyData[] = [
		{ competency: 'Digital Marketing', count: 87, hours: 348, color: '#492E98' }, // OEB Blau
		{ competency: 'Web Development', count: 64, hours: 256, color: '#492E98' }, // OEB Blau (more blue)
		{ competency: 'Project Management', count: 52, hours: 208, color: '#492E98' }, // OEB Blau (more blue)
		{ competency: 'Data Analytics', count: 45, hours: 180, color: '#492E98' }, // OEB Blau
		{ competency: 'Communication Skills', count: 38, hours: 152, color: '#CCD7FF' }, // OEB KI Lila
		{ competency: 'Leadership', count: 31, hours: 124, color: '#93F993' }, // OEB Grün
		{ competency: 'Problem Solving', count: 28, hours: 112, color: '#CCD7FF' }, // OEB KI Lila
		{ competency: 'Teamwork', count: 24, hours: 96, color: '#492E98' }, // OEB Blau
	];

	// ===========================
	// PLZ COMPETENCY BREADTH DATA
	// ===========================

	@Input() plzCompetencyBreadth: { plz: string; competencyCount: number; hours: number }[] = [
		{ plz: '10xxx', competencyCount: 42, hours: 168 },
		{ plz: '20xxx', competencyCount: 38, hours: 152 },
		{ plz: '30xxx', competencyCount: 35, hours: 140 },
		{ plz: '40xxx', competencyCount: 31, hours: 124 },
		{ plz: '50xxx', competencyCount: 28, hours: 112 },
		{ plz: '60xxx', competencyCount: 25, hours: 100 },
		{ plz: '70xxx', competencyCount: 22, hours: 88 },
		{ plz: '80xxx', competencyCount: 19, hours: 76 },
		{ plz: '90xxx', competencyCount: 16, hours: 64 },
	];

	// ===========================
	// LUCIDE ICON SVG PATHS
	// ===========================

	private lucideIcons: { [key: string]: string } = {
		Monitor: 'M20 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2ZM8 21h8M12 17v4',
		Users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
		Globe: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10ZM2 12h20',
		Wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
		BarChart3: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
		Star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
	};

	// ===========================
	// COMPONENT LIFECYCLE
	// ===========================

	constructor() {}

	ngOnInit(): void {
		// Sun rays now created with CSS, no generation needed
		// this.generateSunRays();
	}

	ngAfterViewInit(): void {
		// Render bubble chart after view initialization
		setTimeout(() => {
			this.renderBubbleChart();
		}, 0);
	}

	// ===========================
	// UTILITY METHODS
	// ===========================

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

	// Get maximum competency count for scaling
	getMaxCompetencyCount(): number {
		return Math.max(...this.individualCompetencyData.map((c) => c.count));
	}

	// Get maximum PLZ competency count for scaling
	getMaxPLZCompetencyCount(): number {
		return Math.max(...this.plzCompetencyBreadth.map((p) => p.competencyCount));
	}

	// ===========================
	// D3 BUBBLE CHART RENDERING
	// ===========================

	renderBubbleChart(): void {
		if (!this.bubbleChartSvg) return;

		const svg = d3.select(this.bubbleChartSvg.nativeElement);

		// Only remove the dynamically generated bubbles, not the sun backgrounds
		svg.selectAll('g:not(.sun-background-large):not(.sun-background-small)').remove();

		const container = this.bubbleChartSvg.nativeElement.parentElement;
		if (!container) return;

		const width = container.clientWidth;
		const height = 400;

		// Create pack layout for bubble chart
		const pack = d3.pack<CompetencyBubbleData>().size([width, height]).padding(10);

		// Prepare data for pack layout
		const root = d3
			.hierarchy<any>({
				children: this.competencyBubbleData,
			})
			.sum((d: any) => d.weight || 0);

		// Generate bubble layout
		const nodes = pack(root).leaves();

		// Create SVG group for bubbles - this will render AFTER the sun backgrounds
		const g = svg.append('g').attr('class', 'bubbles-group');

		// Draw bubbles
		const bubbles = g
			.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
			.attr('class', 'bubble-group');

		// Add circles with full opacity - ALWAYS OEB Blau
		bubbles
			.append('circle')
			.attr('r', (d: any) => d.r)
			.attr('fill', '#492E98') // OEB Blau - hard coded for uniform appearance
			.attr('opacity', 1) // Full opacity for solid appearance
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.style('cursor', 'pointer')
			.on('mouseover', (event: any, d: any) => this.showBubbleTooltip(event, d.data))
			.on('mouseout', () => this.hideBubbleTooltip());

		// Add Lucide icon at top of bubble - SVG based (no background)
		bubbles.each((d: any, i: number, nodes: any) => {
			const bubble = d3.select(nodes[i]);
			const iconSize = Math.min(d.r / 2.5, 36);
			const iconName = d.data.icon || this.getDefaultIcon(d.data.name);
			const iconPath = this.lucideIcons[iconName];

			if (iconPath) {
				// Position icon at top of bubble
				const iconGroup = bubble
					.append('g')
					.attr('class', 'bubble-icon')
					.attr('transform', `translate(0, ${-d.r * 0.5})`);

				// Create SVG for the Lucide icon - no background circle
				const icon = iconGroup
					.append('svg')
					.attr('width', iconSize)
					.attr('height', iconSize)
					.attr('viewBox', '0 0 24 24')
					.attr('x', -iconSize / 2)
					.attr('y', -iconSize / 2)
					.attr('fill', 'none')
					.attr('stroke', 'white')
					.attr('stroke-width', 2.5)
					.attr('stroke-linecap', 'round')
					.attr('stroke-linejoin', 'round');

				// Add the icon path
				icon.append('path').attr('d', iconPath);
			}
		});

		// Add text labels with wrapping - positioned below icon
		bubbles.each(function (d: any) {
			const bubble = d3.select(this);
			const maxWidth = d.r * 1.6; // Max width is 80% of diameter
			const fontSize = Math.min(d.r / 3.5, 13);
			const text = d.data.name;

			// Try to fit text, truncate if necessary
			const words = text.split(' ');
			let line = '';
			let lineNumber = 0;
			const lineHeight = 1.1;
			const maxLines = 2;

			// Position text below icon (positive dy value)
			const textElement = bubble
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('dy', '0.5em') // Moved down to be below icon
				.style('font-size', fontSize + 'px')
				.style('font-weight', 'bold')
				.style('fill', 'white')
				.style('pointer-events', 'none');

			for (let i = 0; i < words.length; i++) {
				const testLine = line + words[i] + ' ';
				const testWidth = testLine.length * fontSize * 0.6; // Approximate width

				if (testWidth > maxWidth && line !== '') {
					if (lineNumber < maxLines - 1) {
						textElement
							.append('tspan')
							.attr('x', 0)
							.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
							.text(line.trim());
						line = words[i] + ' ';
						lineNumber++;
					} else {
						// Last line, add ellipsis
						textElement
							.append('tspan')
							.attr('x', 0)
							.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
							.text(line.trim() + '...');
						break;
					}
				} else {
					line = testLine;
				}
			}

			// Add remaining text if within max lines
			if (lineNumber < maxLines && line.trim() !== '') {
				textElement
					.append('tspan')
					.attr('x', 0)
					.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
					.text(line.trim());
			}
		});

		// Add value labels - positioned below text at bottom
		bubbles
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', (d: any) => {
				// Calculate position based on bubble size to ensure it's at bottom
				const offset = d.r * 0.4;
				return `${offset}px`;
			})
			.style('font-size', (d: any) => Math.min(d.r / 4.5, 11) + 'px')
			.style('fill', 'white')
			.style('font-weight', '600')
			.style('pointer-events', 'none')
			.text((d: any) => d.data.value + '%');
	}

	// Show bubble chart tooltip
	showBubbleTooltip(event: any, data: CompetencyBubbleData): void {
		if (!this.bubbleTooltip) return;

		const tooltip = this.bubbleTooltip.nativeElement;
		tooltip.innerHTML = `
			<div class="tw-font-semibold tw-mb-1 tw-flex tw-items-center tw-gap-2">
				<span class="tw-text-base">${this.getIconForTooltip(data.icon || this.getDefaultIcon(data.name))}</span>
				<span>${data.name}</span>
			</div>
			<div class="tw-text-xs">${data.value}% der Kompetenzen</div>
			<div class="tw-text-xs tw-text-gray-300">${data.weight} Badges</div>
		`;

		tooltip.classList.remove('tw-hidden');

		// Position tooltip near mouse with better positioning
		const container = this.bubbleChartSvg.nativeElement.parentElement;
		if (container) {
			const rect = container.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();

			// Calculate position to keep tooltip within container
			let left = event.clientX - rect.left + 15;
			let top = event.clientY - rect.top - tooltipRect.height - 10;

			// Adjust if tooltip goes out of bounds
			if (left + tooltipRect.width > rect.width) {
				left = event.clientX - rect.left - tooltipRect.width - 15;
			}
			if (top < 0) {
				top = event.clientY - rect.top + 15;
			}

			tooltip.style.left = `${left}px`;
			tooltip.style.top = `${top}px`;
		}
	}

	// Hide bubble chart tooltip
	hideBubbleTooltip(): void {
		if (!this.bubbleTooltip) return;
		this.bubbleTooltip.nativeElement.classList.add('tw-hidden');
	}

	// Get current date for footer
	getCurrentDate(): string {
		return new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}

	// Get default icon name based on competency name
	private getDefaultIcon(name: string): string {
		const iconMap: { [key: string]: string } = {
			'IT & Digital': 'Monitor',
			'Soziale Kompetenzen': 'Users',
			Sprachen: 'Globe',
			Handwerk: 'Wrench',
			Management: 'BarChart3',
			Andere: 'Star',
		};
		return iconMap[name] || 'Star';
	}

	// Get SVG icon for tooltip display
	private getIconForTooltip(iconName: string): string {
		const iconPath = this.lucideIcons[iconName];
		if (!iconPath) return '';

		return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
			<path d="${iconPath}"></path>
		</svg>`;
	}

	// ===========================
	// SUN BACKGROUND GENERATION
	// ===========================
	// Suns now created with CSS, no JS generation needed
}
