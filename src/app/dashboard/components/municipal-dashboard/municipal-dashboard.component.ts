import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { PlzMapComponent } from '../plz-map/plz-map.component';
import { KompetenzenTrackingComponent } from '../kompetenzen-tracking/kompetenzen-tracking.component';
import { BadgeAnalyseComponent } from '../badge-analyse/badge-analyse.component';
import { Region } from '../regional-filter/regional-filter.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { DashboardMockDataService } from '../../services/dashboard-mock-data.service';
import { BadgeType } from '../../models/dashboard-models';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

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

export interface CompetencyBubbleData {
	name: string;
	value: number;
	weight: number;
	color: string;
}

@Component({
	selector: 'app-municipal-dashboard',
	standalone: true,
	imports: [CommonModule, FormsModule, PlzMapComponent, KompetenzenTrackingComponent, BadgeAnalyseComponent],
	templateUrl: './municipal-dashboard.component.html',
	styleUrls: ['./municipal-dashboard.component.scss'],
})
export class MunicipalDashboardComponent implements OnInit, OnDestroy {
	selectedRegion: Region | null = null;

	// Loading states
	loading = {
		overview: false,
		badges: false,
		competencies: false,
		timeSeries: false,
	};
	errorState: string | null = null;

	// Subscriptions for cleanup
	private subscriptions = new Subscription();

	// Badge Type Statistics (NEW) - OEB Color Scheme
	// Loaded from mock JSON files as fallback
	badgeTypeStats: BadgeTypeStats[] = [];

	// Total badges count
	get totalBadges(): number {
		return this.badgeTypeStats.reduce((sum, stat) => sum + stat.count, 0);
	}

	// Competency Bubble Data (NEW) - OEB Color Scheme
	// Loaded from mock JSON files as fallback
	competencyBubbleData: CompetencyBubbleData[] = [];

	// Badge Awards by Year/Month/Type (NEW)
	// Loaded from mock JSON files as fallback
	badgeAwardsByTime: BadgeAwardData[] = [];

	// Filter state for line chart
	selectedYear: number = 2024;
	selectedMonth: number | null = null;
	selectedBadgeType: string = 'all';

	// Loaded from mock JSON files as fallback
	availableYears: number[] = [];
	availableMonths: { value: number; label: string }[] = [];
	badgeTypes: { value: string; label: string }[] = [];

	// Top 3 Key Metrics (Primary KPIs)
	// Loaded from mock JSON files as fallback
	topKpis: KPIData[] = [];

	// Secondary KPIs
	// Loaded from mock JSON files as fallback
	kpis: KPIData[] = [];

	// Loaded from mock JSON files as fallback
	genderCompetencyData: ChartData = {
		labels: [],
		values: [],
		backgroundColor: [],
	};

	// Loaded from mock JSON files as fallback
	escoCompetencyData: ChartData = {
		labels: [],
		values: [],
		backgroundColor: [],
	};

	// Badge competency data for horizontal bar chart - Loaded from mock JSON files as fallback
	badgeCompetencyData: { badgeTitle: string; count: number; color: string }[] = [];

	// Loaded from mock JSON files as fallback
	plzDistributionData: ChartData = {
		labels: [],
		values: [],
		backgroundColor: [],
	};

	// Loaded from mock JSON files as fallback
	recentActivities: any[] = [];

	constructor(
		private router: Router,
		private dashboardData: DashboardDataService,
		private mockData: DashboardMockDataService,
	) {}

	ngOnInit(): void {
		this.loadRegionSelection();
		this.loadMockDataAsFallback();
		this.loadDashboardData();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private loadRegionSelection(): void {
		// Load selected region from localStorage
		const savedRegion = localStorage.getItem('selectedRegion');
		if (savedRegion) {
			try {
				this.selectedRegion = JSON.parse(savedRegion);
			} catch (e) {
				console.error('Error parsing saved region:', e);
				// If no valid region, redirect to regional selection
				this.router.navigate(['/dashboard/regional-select']);
			}
		} else {
			// No region selected, redirect to regional selection
			this.router.navigate(['/dashboard/regional-select']);
		}
	}

	/**
	 * Load mock data from JSON files as fallback
	 * This ensures we have data to display even if APIs are not yet implemented
	 */
	private loadMockDataAsFallback(): void {
		console.log('[DASHBOARD] Loading mock data as fallback...');

		// Load all mock data in parallel
		const mockDataSub = this.mockData.getAllKPIs().subscribe({
			next: (kpis) => {
				console.log('[DASHBOARD] KPIs received:', kpis);
				this.topKpis = kpis.topKpis;
				this.kpis = kpis.secondaryKpis;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading KPIs:', error);
			},
		});

		const badgeTypeStatsSub = this.mockData.getBadgeTypeStats().subscribe({
			next: (stats) => {
				console.log('[DASHBOARD] Badge Type Stats received:', stats);
				this.badgeTypeStats = stats;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Badge Type Stats:', error);
			},
		});

		const competencyBubbleSub = this.mockData.getCompetencyBubbleData().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] Competency Bubble Data received:', data);
				this.competencyBubbleData = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Competency Bubble Data:', error);
			},
		});

		const timeSeriesSub = this.mockData
			.getBadgeAwardsTimeSeries({
				year: this.selectedYear,
				month: this.selectedMonth,
				type: this.selectedBadgeType,
			})
			.subscribe({
				next: (data) => {
					console.log('[DASHBOARD] Badge Awards Time Series received:', data.length, 'items');
					this.badgeAwardsByTime = data;
				},
				error: (error) => {
					console.error('[DASHBOARD] Error loading Badge Awards Time Series:', error);
				},
			});

		const genderSub = this.mockData.getGenderCompetencyData().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] Gender Competency Data received:', data);
				this.genderCompetencyData = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Gender Competency Data:', error);
			},
		});

		const escoSub = this.mockData.getEscoCompetencyData().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] ESCO Competency Data received:', data);
				this.escoCompetencyData = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading ESCO Competency Data:', error);
			},
		});

		const badgeCompSub = this.mockData.getBadgeCompetencyData().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] Badge Competency Data received:', data);
				this.badgeCompetencyData = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Badge Competency Data:', error);
			},
		});

		const plzSub = this.mockData.getPlzDistributionData().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] PLZ Distribution Data received:', data);
				this.plzDistributionData = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading PLZ Distribution Data:', error);
			},
		});

		const activitiesSub = this.mockData.getRecentActivities().subscribe({
			next: (data) => {
				console.log('[DASHBOARD] Recent Activities received:', data);
				this.recentActivities = data;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Recent Activities:', error);
			},
		});

		const filtersSub = this.mockData.getAllFilterOptions().subscribe({
			next: (filters) => {
				console.log('[DASHBOARD] Filter Options received:', filters);
				this.availableYears = filters.availableYears;
				this.availableMonths = filters.availableMonths;
				this.badgeTypes = filters.badgeTypes;
			},
			error: (error) => {
				console.error('[DASHBOARD] Error loading Filter Options:', error);
			},
		});

		// Add all subscriptions for cleanup
		this.subscriptions.add(mockDataSub);
		this.subscriptions.add(badgeTypeStatsSub);
		this.subscriptions.add(competencyBubbleSub);
		this.subscriptions.add(timeSeriesSub);
		this.subscriptions.add(genderSub);
		this.subscriptions.add(escoSub);
		this.subscriptions.add(badgeCompSub);
		this.subscriptions.add(plzSub);
		this.subscriptions.add(activitiesSub);
		this.subscriptions.add(filtersSub);
	}

	private loadDashboardData(): void {
		this.loading.overview = true;
		this.errorState = null;

		// Load complete dashboard in parallel
		const overviewSub = this.dashboardData.getDashboardOverview().subscribe({
			next: (overview) => {
				// Update only if data is available
				if (overview.badgeStatistics?.byType) {
					this.badgeTypeStats = overview.badgeStatistics.byType;
				}
				if (overview.kpis && overview.kpis.length > 0) {
					this.topKpis = overview.kpis.slice(0, 3);
					this.kpis = overview.kpis.slice(3);
				}
				if (overview.competencyData?.distribution) {
					this.competencyBubbleData = overview.competencyData.distribution;
				}
				if (overview.activityFeed) {
					this.recentActivities = overview.activityFeed;
				}
				this.loading.overview = false;

				// Load time series data after overview is loaded
				this.loadBadgeTimeSeries();

				// Load additional data
				this.loadGenderCompetencyData();
				this.loadEscoCompetencyData();
				this.loadBadgeCompetencyData();
			},
			error: (error) => {
				console.warn('Dashboard API not fully available, using fallback data:', error);
				// Silently fall back to hardcoded data - no error message displayed
				this.loading.overview = false;

				// Still try to load time series data
				this.loadBadgeTimeSeries();
			},
		});

		this.subscriptions.add(overviewSub);
	}

	private loadBadgeTimeSeries(): void {
		this.loading.timeSeries = true;

		const timeSeriesSub = this.dashboardData
			.getBadgeAwardsTimeSeries({
				year: this.selectedYear,
				month: this.selectedMonth,
				type: this.selectedBadgeType === 'all' ? undefined : (this.selectedBadgeType as BadgeType),
			})
			.subscribe({
				next: (data) => {
					if (data && data.length > 0) {
						this.badgeAwardsByTime = data;
					}
					this.loading.timeSeries = false;
				},
				error: (error) => {
					console.warn('Badge time series API not available, using mock data:', error);
					// Fall back to mock data from JSON file
					this.mockData
						.getBadgeAwardsTimeSeries({
							year: this.selectedYear,
							month: this.selectedMonth,
							type: this.selectedBadgeType,
						})
						.subscribe((mockData) => {
							this.badgeAwardsByTime = mockData;
							this.loading.timeSeries = false;
						});
				},
			});

		this.subscriptions.add(timeSeriesSub);
	}

	private loadGenderCompetencyData(): void {
		const genderSub = this.dashboardData.getGenderCompetencyDistribution().subscribe({
			next: (data) => {
				if (data) {
					this.genderCompetencyData = data;
				}
			},
			error: (error) => {
				console.warn('Gender competency API not available, using fallback data:', error);
				// Keep hardcoded data
			},
		});

		this.subscriptions.add(genderSub);
	}

	private loadEscoCompetencyData(): void {
		const escoSub = this.dashboardData.getEscoCompetencyDistribution().subscribe({
			next: (data) => {
				if (data) {
					this.escoCompetencyData = data;
				}
			},
			error: (error) => {
				console.warn('ESCO competency API not available, using fallback data:', error);
				// Keep hardcoded data
			},
		});

		this.subscriptions.add(escoSub);
	}

	private loadBadgeCompetencyData(): void {
		const badgeSub = this.dashboardData.getTopBadges(6).subscribe({
			next: (badges) => {
				if (badges && badges.length > 0) {
					this.badgeCompetencyData = badges;
				}
			},
			error: (error) => {
				console.warn('Top badges API not available, using fallback data:', error);
				// Keep hardcoded data
			},
		});

		this.subscriptions.add(badgeSub);
	}

	changeRegion(): void {
		// Clear the selected region and navigate to regional selection
		localStorage.removeItem('selectedRegion');
		this.router.navigate(['/dashboard/regional-select']);
	}

	// Filter methods for badge analysis - reload data when filters change
	onYearChange(year: number): void {
		this.selectedYear = year;
		this.loadBadgeTimeSeries();
	}

	onMonthChange(month: number | null): void {
		this.selectedMonth = month;
		this.loadBadgeTimeSeries();
	}

	onBadgeTypeChange(type: string): void {
		this.selectedBadgeType = type;
		this.loadBadgeTimeSeries();
	}

	// Refresh all dashboard data
	refreshDashboard(): void {
		this.dashboardData.refreshData();
		this.loadDashboardData();
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
			case 'esco':
				return 'lucideRefreshCw';
			case 'institution':
				return 'lucideBuilding';
			default:
				return 'lucideInfo';
		}
	}

	showTooltip: boolean = false;
	tooltipText: string = '';

	getActivityColor(type: string): string {
		switch (type) {
			case 'badge':
				return 'text-yellow-600';
			case 'esco':
				return 'text-blue-600';
			case 'course':
				return 'text-green-600';
			case 'institution':
				return 'text-purple-600';
			default:
				return 'text-gray-600';
		}
	}

	// Get progressive bar height based on rank (1st = tallest, 3rd = shortest)
	getProgressiveBarHeight(rank: number): string {
		switch (rank) {
			case 1:
				return '80px'; // 1st place - tallest
			case 2:
				return '60px'; // 2nd place - medium
			case 3:
				return '50px'; // 3rd place - shortest
			default:
				return '50px';
		}
	}

	// Get maximum badge competency count for horizontal bar chart scaling
	getMaxBadgeCompetencyCount(): number {
		return Math.max(...this.badgeCompetencyData.map((b) => b.count));
	}
}
