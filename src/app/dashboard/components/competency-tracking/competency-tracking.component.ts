import { Component, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ZipCodeMapComponent, ZipCodeDetailMetrics } from '../zip-code-map/zip-code-map.component';
import * as d3 from 'd3';
import { KPIData, ChartData, CompetencyBubbleData } from '../../models/dashboard-models';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

export interface CompetencyBubbleDataExtended extends CompetencyBubbleData {
	icon?: string;
}

export interface CompetencyData {
	competency: string;
	competencyKey: string;
	translationKey: string;
	count: number;
	hours: number;
	color: string;
	institutions?: number;
	learners?: number;
}

export interface GenderDrillDownData {
	gender: string;
	topKompetenzbereiche: CompetencyBubbleDataExtended[];
	topEinzelkompetenzen: CompetencyData[];
}

export interface SunRay {
	x1: string;
	y1: string;
	x2: string;
	y2: string;
	startWidth: number;
	endWidth: number;
	delay: string;
}

@Component({
	selector: 'app-competency-tracking',
	standalone: true,
	imports: [CommonModule, FormsModule, ZipCodeMapComponent, TranslatePipe],
	templateUrl: './competency-tracking.component.html',
	styleUrls: ['./competency-tracking.component.scss']
})
export class CompetencyTrackingComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
	@ViewChild('bubbleChartSvg') bubbleChartSvg!: ElementRef<SVGSVGElement>;
	@ViewChild('bubbleTooltip') bubbleTooltip!: ElementRef<HTMLDivElement>;

	@Input() escoCompetencyData: ChartData = {
		labels: ['IT & Digital', 'Soziale Kompetenzen', 'Sprachen', 'Handwerk', 'Management', 'Andere'],
		values: [28.5, 22.1, 18.3, 12.7, 10.8, 7.6],
		backgroundColor: ['#492E98', '#492E98', '#93F993', '#CCD7FF', '#E4FFE4', '#757575']
	};

	@Input() competencyBubbleData: CompetencyBubbleDataExtended[] = [
		{ name: 'IT & Digital', value: 28.5, weight: 285, color: '#492E98', icon: 'Monitor' },
		{ name: 'Soziale Kompetenzen', value: 22.1, weight: 221, color: '#492E98', icon: 'Users' },
		{ name: 'Sprachen', value: 18.3, weight: 183, color: '#492E98', icon: 'Globe' },
		{ name: 'Handwerk', value: 12.7, weight: 127, color: '#492E98', icon: 'Wrench' },
		{ name: 'Management', value: 10.8, weight: 108, color: '#492E98', icon: 'BarChart3' },
		{ name: 'Andere', value: 7.6, weight: 76, color: '#492E98', icon: 'Star' }
	];

	@Input() genderCompetencyData: ChartData = {
		labels: ['Männlich', 'Weiblich'],
		values: [52.2, 47.8],
		backgroundColor: ['#492E98', '#492E98']
	};

	@Input() individualCompetencyData: CompetencyData[] = [];

	@Input() zipCodeCompetencyBreadth: { zipCode: string; competencyCount: number; hours: number }[] = [
		{ zipCode: '10xxx', competencyCount: 42, hours: 168 },
		{ zipCode: '20xxx', competencyCount: 38, hours: 152 },
		{ zipCode: '30xxx', competencyCount: 35, hours: 140 },
		{ zipCode: '40xxx', competencyCount: 31, hours: 124 },
		{ zipCode: '50xxx', competencyCount: 28, hours: 112 },
		{ zipCode: '60xxx', competencyCount: 25, hours: 100 },
		{ zipCode: '70xxx', competencyCount: 22, hours: 88 },
		{ zipCode: '80xxx', competencyCount: 19, hours: 76 },
		{ zipCode: '90xxx', competencyCount: 16, hours: 64 }
	];

	private genderDrillDownMockData: { [key: string]: GenderDrillDownData } = {};

	private lucideIcons: { [key: string]: string } = {
		'Monitor': 'M20 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2ZM8 21h8M12 17v4',
		'Users': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
		'Globe': 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10ZM2 12h20',
		'Wrench': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
		'BarChart3': 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
		'Star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
	};

	monthlyCompetencies: any[] = [];
	loadingMonthlyCompetencies = false;
	Math = Math;

	constructor(
		private router: Router,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		if (this.individualCompetencyData.length === 0) {
			this.individualCompetencyData = [
				{ competency: 'Digital Marketing', competencyKey: 'digital-marketing', translationKey: 'Dashboard.competency.digitalMarketing', count: 87, hours: 348, color: '#492E98' },
				{ competency: 'Web Development', competencyKey: 'web-development', translationKey: 'Dashboard.competency.webDevelopment', count: 64, hours: 256, color: '#492E98' },
				{ competency: 'Project Management', competencyKey: 'project-management', translationKey: 'Dashboard.competency.projectManagement', count: 52, hours: 208, color: '#492E98' },
				{ competency: 'Data Analytics', competencyKey: 'data-analytics', translationKey: 'Dashboard.competency.dataAnalytics', count: 45, hours: 180, color: '#492E98' },
				{ competency: 'Communication Skills', competencyKey: 'communication-skills', translationKey: 'Dashboard.competency.communicationSkills', count: 38, hours: 152, color: '#CCD7FF' },
				{ competency: 'Leadership', competencyKey: 'leadership', translationKey: 'Dashboard.competency.leadership', count: 31, hours: 124, color: '#CCD7FF' },
				{ competency: 'Problem Solving', competencyKey: 'problem-solving', translationKey: 'Dashboard.competency.problemSolving', count: 28, hours: 112, color: '#CCD7FF' },
				{ competency: 'Teamwork', competencyKey: 'teamwork', translationKey: 'Dashboard.competency.teamwork', count: 24, hours: 96, color: '#492E98' }
			];
		}

		this.genderDrillDownMockData = {
			'Männlich': {
				gender: 'Männlich',
				topKompetenzbereiche: [
					{ name: 'IT & Digital', value: 35.2, weight: 352, color: '#492E98', icon: 'Monitor' },
					{ name: 'Handwerk', value: 18.5, weight: 185, color: '#492E98', icon: 'Wrench' },
					{ name: 'Management', value: 15.3, weight: 153, color: '#492E98', icon: 'BarChart3' }
				],
				topEinzelkompetenzen: [
					{ competency: 'Web Development', competencyKey: 'web-development', translationKey: 'Dashboard.competency.webDevelopment', count: 52, hours: 208, color: '#492E98' },
					{ competency: 'Project Management', competencyKey: 'project-management', translationKey: 'Dashboard.competency.projectManagement', count: 38, hours: 152, color: '#492E98' },
					{ competency: 'Data Analytics', competencyKey: 'data-analytics', translationKey: 'Dashboard.competency.dataAnalytics', count: 31, hours: 124, color: '#CCD7FF' }
				]
			},
			'Weiblich': {
				gender: 'Weiblich',
				topKompetenzbereiche: [
					{ name: 'Soziale Kompetenzen', value: 32.8, weight: 328, color: '#492E98', icon: 'Users' },
					{ name: 'Sprachen', value: 25.4, weight: 254, color: '#492E98', icon: 'Globe' },
					{ name: 'IT & Digital', value: 18.7, weight: 187, color: '#492E98', icon: 'Monitor' }
				],
				topEinzelkompetenzen: [
					{ competency: 'Digital Marketing', competencyKey: 'digital-marketing', translationKey: 'Dashboard.competency.digitalMarketing', count: 64, hours: 256, color: '#492E98' },
					{ competency: 'Communication Skills', competencyKey: 'communication-skills', translationKey: 'Dashboard.competency.communicationSkills', count: 47, hours: 188, color: '#492E98' },
					{ competency: 'Leadership', competencyKey: 'leadership', translationKey: 'Dashboard.competency.leadership', count: 35, hours: 140, color: '#93F993' }
				]
			}
		};
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.renderBubbleChart();
		}, 100);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['competencyBubbleData']) {
			setTimeout(() => {
				this.renderBubbleChart();
			}, 100);
		}
	}

	getMaxCompetencyCount(): number {
		return Math.max(...this.individualCompetencyData.map(c => c.count));
	}

	getMaxZipCodeCompetencyCount(): number {
		return Math.max(...this.zipCodeCompetencyBreadth.map(p => p.competencyCount));
	}

	renderBubbleChart(): void {
		if (!this.bubbleChartSvg) {
			return;
		}

		if (!this.competencyBubbleData || this.competencyBubbleData.length === 0) {
			return;
		}

		const svg = d3.select(this.bubbleChartSvg.nativeElement);
		svg.selectAll('*').remove();

		const container = this.bubbleChartSvg.nativeElement.parentElement;
		if (!container) {
			return;
		}

		const width = 600;
		const height = 400;

		const pack = d3.pack<CompetencyBubbleData>()
			.size([width, height])
			.padding(20);

		const root = d3.hierarchy<any>({
			children: this.competencyBubbleData
		})
			.sum((d: any) => d.weight || 0);

		const nodes = pack(root).leaves();
		const g = svg.append('g').attr('class', 'bubbles-group');

		const bubbles = g.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
			.attr('class', 'bubble-group');

		bubbles.append('circle')
			.attr('r', (d: any) => d.r)
			.attr('fill', '#492E98')
			.attr('opacity', 1)
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.style('cursor', 'pointer')
			.on('mouseover', (event: any, d: any) => this.showBubbleTooltip(event, d.data))
			.on('mousemove', (event: any, d: any) => this.showBubbleTooltip(event, d.data))
			.on('mouseout', () => this.hideBubbleTooltip())
			.on('click', (event: any, d: any) => this.onBubbleClick(d.data));

		bubbles.each((d: any, i: number, nodes: any) => {
			const bubble = d3.select(nodes[i]);
			const iconSize = Math.min(d.r / 2.5, 36);
			const iconName = d.data.icon || this.getDefaultIcon(d.data.name);
			const iconPath = this.lucideIcons[iconName];

			if (iconPath) {
				const iconGroup = bubble.append('g')
					.attr('class', 'bubble-icon')
					.attr('transform', `translate(0, ${-d.r * 0.5})`);

				const icon = iconGroup.append('svg')
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

				icon.append('path')
					.attr('d', iconPath);
			}
		});

		bubbles.each(function(d: any) {
			const bubble = d3.select(this);
			const maxWidth = d.r * 1.6;
			const fontSize = Math.min(d.r / 3.5, 13);
			const text = d.data.name;

			const words = text.split(' ');
			let line = '';
			let lineNumber = 0;
			const lineHeight = 1.1;
			const maxLines = 2;

			const textElement = bubble.append('text')
				.attr('text-anchor', 'middle')
				.attr('dy', '0.5em')
				.style('font-size', fontSize + 'px')
				.style('font-weight', 'bold')
				.style('fill', 'white')
				.style('pointer-events', 'none');

			for (let i = 0; i < words.length; i++) {
				const testLine = line + words[i] + ' ';
				const testWidth = testLine.length * fontSize * 0.6;

				if (testWidth > maxWidth && line !== '') {
					if (lineNumber < maxLines - 1) {
						textElement.append('tspan')
							.attr('x', 0)
							.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
							.text(line.trim());
						line = words[i] + ' ';
						lineNumber++;
					} else {
						textElement.append('tspan')
							.attr('x', 0)
							.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
							.text(line.trim() + '...');
						break;
					}
				} else {
					line = testLine;
				}
			}

			if (lineNumber < maxLines && line.trim() !== '') {
				textElement.append('tspan')
					.attr('x', 0)
					.attr('dy', lineNumber === 0 ? 0 : lineHeight + 'em')
					.text(line.trim());
			}
		});

		bubbles.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', (d: any) => {
				const offset = d.r * 0.4;
				return `${offset}px`;
			})
			.style('font-size', (d: any) => Math.min(d.r / 4.5, 11) + 'px')
			.style('fill', 'white')
			.style('font-weight', '600')
			.style('pointer-events', 'none')
			.text((d: any) => d.data.value + '%');
	}

	showBubbleTooltip(event: any, data: CompetencyBubbleDataExtended): void {
		if (!this.bubbleTooltip) return;

		const tooltip = this.bubbleTooltip.nativeElement;
		tooltip.innerHTML = `
			<div class="tw-font-semibold tw-mb-1 tw-flex tw-items-center tw-gap-2">
				<span class="tw-text-base">${this.getIconForTooltip(data.icon || this.getDefaultIcon(data.name || ''))}</span>
				<span>${data.name || data.areaKey || 'Unknown'}</span>
			</div>
			<div class="tw-text-xs">${data.value}% der Kompetenzen</div>
			<div class="tw-text-xs tw-text-gray-300">${data.weight} Badges</div>
		`;

		tooltip.classList.remove('tw-hidden');

		const container = this.bubbleChartSvg.nativeElement.parentElement;
		if (container) {
			const rect = container.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();

			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			const offsetX = 10;
			const offsetY = 10;

			let left = mouseX + offsetX;
			let top = mouseY + offsetY;

			if (left + tooltipRect.width > rect.width) {
				left = mouseX - tooltipRect.width - offsetX;
			}

			if (top + tooltipRect.height > rect.height) {
				top = mouseY - tooltipRect.height - offsetY;
			}

			if (left < 0) {
				left = offsetX;
			}

			if (top < 0) {
				top = offsetY;
			}

			tooltip.style.left = `${left}px`;
			tooltip.style.top = `${top}px`;
		}
	}

	hideBubbleTooltip(): void {
		if (!this.bubbleTooltip) return;
		this.bubbleTooltip.nativeElement.classList.add('tw-hidden');
	}

	getCurrentDate(): string {
		return new Date().toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	private getDefaultIcon(name: string): string {
		const iconMap: { [key: string]: string } = {
			'IT & Digital': 'Monitor',
			'Soziale Kompetenzen': 'Users',
			'Sprachen': 'Globe',
			'Handwerk': 'Wrench',
			'Management': 'BarChart3',
			'Andere': 'Star'
		};
		return iconMap[name] || 'Star';
	}

	private getIconForTooltip(iconName: string): string {
		const iconPath = this.lucideIcons[iconName];
		if (!iconPath) return '';

		return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
			<path d="${iconPath}"></path>
		</svg>`;
	}

	get totalMonthlyCompetencies(): number {
		return this.monthlyCompetencies.reduce((total, item) => {
			const value = typeof item.value === 'number' ? item.value : 0;
			return total + value;
		}, 0);
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return '';
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	getMonthlyDetailTitle(item: any): string {
		if (item.title) return item.title;
		if (item.competencyKey) {
			const competencyKeyToTranslationMap: Record<string, string> = {
				'web_development': 'Dashboard.competency.webDevelopment',
				'data_analytics': 'Dashboard.competency.dataAnalytics',
				'project_management': 'Dashboard.competency.projectManagement',
				'digital_marketing': 'Dashboard.competency.digitalMarketing',
				'communication_skills': 'Dashboard.competency.communicationSkills',
				'leadership': 'Dashboard.competency.leadership'
			};
			const translationKey = competencyKeyToTranslationMap[item.competencyKey];
			return translationKey ? this.translate.instant(translationKey) : item.competencyKey;
		}
		return 'Unbekannt';
	}

	getMonthlyDetailCategory(item: any): string {
		if (item.category) return item.category;
		if (item.categoryKey) {
			const categoryMap: Record<string, string> = {
				'it_digital': 'IT & Digital',
				'social': 'Soziale Kompetenzen',
				'management': 'Management',
				'languages': 'Sprachen'
			};
			return categoryMap[item.categoryKey] || item.categoryKey;
		}
		return '';
	}

	getMonthlyDetailValue(item: any): string {
		if (item.value === 'new' || item.value === 'neu') return 'NEU';
		if (typeof item.value === 'number') return item.value.toString();
		return item.value?.toString() || '—';
	}

	openGenderDrillDown(gender: string): void {
		const genderType = gender.toLowerCase().replace(/\s+/g, '-');
		this.router.navigate(['/dashboard/gender', genderType]);
	}

	onZipCodeRegionClick(zipCode: string): void {
		this.router.navigate(['/dashboard/postal-code', zipCode]);
	}

	onBubbleClick(data: CompetencyBubbleDataExtended): void {
		const areaKey = this.convertNameToAreaKey(data.name || '');
		this.router.navigate(['/dashboard/competency-area', areaKey]);
	}

	private convertNameToAreaKey(name: string): string {
		const nameToKeyMap: { [key: string]: string } = {
			'IT & Digital': 'it-digital',
			'Soziale Kompetenzen': 'soziale-kompetenzen',
			'Sprachen': 'sprachen',
			'Handwerk': 'handwerk',
			'Management': 'management',
			'Andere': 'andere'
		};
		return nameToKeyMap[name] || name.toLowerCase().replace(/\s+/g, '-');
	}

	openCompetencyDetail(competency: CompetencyData): void {
		const competencyKey = competency.competencyKey || this.convertCompetencyNameToKey(competency.competency);
		this.router.navigate(['/dashboard/competency', competencyKey]);
	}

	private convertCompetencyNameToKey(name: string): string {
		const nameToKeyMap: { [key: string]: string } = {
			'Digital Marketing': 'digital-marketing',
			'Web Development': 'web-development',
			'Project Management': 'project-management',
			'Data Analytics': 'data-analytics',
			'Communication Skills': 'communication-skills',
			'Leadership': 'leadership',
			'Problem Solving': 'problem-solving',
			'Teamwork': 'teamwork',
			'Digitales Marketing': 'digital-marketing',
			'Webentwicklung': 'web-development',
			'Projektmanagement': 'project-management',
			'Datenanalyse': 'data-analytics',
			'Kommunikationsfähigkeiten': 'communication-skills',
			'Führung': 'leadership',
			'Problemlösung': 'problem-solving',
			'Teamarbeit': 'teamwork'
		};
		return nameToKeyMap[name] || name.toLowerCase().replace(/\s+/g, '-');
	}

	ngOnDestroy(): void {
	}
}
