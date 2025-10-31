import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {
	BadgeTypeStats,
	CompetencyBubbleData,
	BadgeAwardData,
	KPIData,
	ChartData,
	BadgeCompetencyData,
	ActivityItem,
} from '../models/dashboard-models';

/**
 * DashboardMockDataService
 *
 * Centralized service for loading mock/fallback data from JSON files.
 * This ensures all business-relevant data (badges, competencies, postal codes, etc.)
 * is stored in static JSON files rather than hardcoded in components.
 *
 * Benefits:
 * - Easy to update mock data without touching code
 * - Consistent fallback behavior when APIs are unavailable
 * - Separation of concerns (data vs. presentation logic)
 * - Type-safe data loading with TypeScript interfaces
 *
 * Usage:
 * ```typescript
 * constructor(private mockData: DashboardMockDataService) {}
 *
 * ngOnInit() {
 *   this.mockData.getBadgeTypeStats().subscribe(stats => {
 *     this.badgeTypeStats = stats;
 *   });
 * }
 * ```
 */
@Injectable({
	providedIn: 'root',
})
export class DashboardMockDataService {
	private readonly MOCK_DATA_PATH = '/assets/dashboard/mocks/';

	// Cache observables to avoid multiple HTTP requests
	private badgeTypeStatsCache$?: Observable<BadgeTypeStats[]>;
	private competencyBubbleCache$?: Observable<CompetencyBubbleData[]>;
	private kpisCache$?: Observable<{ topKpis: KPIData[]; secondaryKpis: KPIData[] }>;
	private filterOptionsCache$?: Observable<any>;

	constructor(private http: HttpClient) {}

	/**
	 * Get badge type statistics (Participation, Competency, Learning Path)
	 * @returns Observable<BadgeTypeStats[]>
	 */
	getBadgeTypeStats(): Observable<BadgeTypeStats[]> {
		if (!this.badgeTypeStatsCache$) {
			this.badgeTypeStatsCache$ = this.http.get<any>(`${this.MOCK_DATA_PATH}badge-type-stats.mock.json`).pipe(
				map((response) => {
					console.log('[MOCK DATA] Badge Type Stats loaded:', response.data);
					return response.data as BadgeTypeStats[];
				}),
				shareReplay(1),
			);
		}
		return this.badgeTypeStatsCache$;
	}

	/**
	 * Get competency bubble data for bubble chart visualization
	 * @returns Observable<CompetencyBubbleData[]>
	 */
	getCompetencyBubbleData(): Observable<CompetencyBubbleData[]> {
		if (!this.competencyBubbleCache$) {
			this.competencyBubbleCache$ = this.http.get<any>(`${this.MOCK_DATA_PATH}competency-bubble.mock.json`).pipe(
				map((response) => {
					console.log('[MOCK DATA] Competency Bubble Data loaded:', response.data);
					return response.data as CompetencyBubbleData[];
				}),
				shareReplay(1),
			);
		}
		return this.competencyBubbleCache$;
	}

	/**
	 * Get badge awards time series data (2023-2025)
	 * @param params - Optional filters for year, month, and badge type
	 * @returns Observable<BadgeAwardData[]>
	 */
	getBadgeAwardsTimeSeries(params?: {
		year?: number;
		month?: number | null;
		type?: string;
	}): Observable<BadgeAwardData[]> {
		return this.http.get<any>(`${this.MOCK_DATA_PATH}badge-awards-timeseries.mock.json`).pipe(
			map((response) => {
				let data = response.data.map((item: any) => ({
					...item,
					date: new Date(item.date),
				})) as BadgeAwardData[];

				// Apply filters if provided
				if (params) {
					if (params.year) {
						data = data.filter((item) => item.year === params.year);
					}
					if (params.month !== null && params.month !== undefined) {
						data = data.filter((item) => item.month === params.month);
					}
					if (params.type && params.type !== 'all') {
						data = data.filter((item) => item.type === params.type);
					}
				}

				return data;
			}),
		);
	}

	/**
	 * Get top KPIs (primary metrics)
	 * @returns Observable<KPIData[]>
	 */
	getTopKPIs(): Observable<KPIData[]> {
		return this.getAllKPIs().pipe(map((kpis) => kpis.topKpis));
	}

	/**
	 * Get secondary KPIs
	 * @returns Observable<KPIData[]>
	 */
	getSecondaryKPIs(): Observable<KPIData[]> {
		return this.getAllKPIs().pipe(map((kpis) => kpis.secondaryKpis));
	}

	/**
	 * Get all KPIs (top + secondary)
	 * @returns Observable<{topKpis: KPIData[], secondaryKpis: KPIData[]}>
	 */
	getAllKPIs(): Observable<{ topKpis: KPIData[]; secondaryKpis: KPIData[] }> {
		if (!this.kpisCache$) {
			this.kpisCache$ = this.http.get<any>(`${this.MOCK_DATA_PATH}kpis.mock.json`).pipe(
				map((response) => {
					console.log('[MOCK DATA] KPIs loaded:', response);
					return {
						topKpis: response.topKpis as KPIData[],
						secondaryKpis: response.secondaryKpis as KPIData[],
					};
				}),
				shareReplay(1),
			);
		}
		return this.kpisCache$;
	}

	/**
	 * Get gender-based competency distribution chart data
	 * @returns Observable<ChartData>
	 */
	getGenderCompetencyData(): Observable<ChartData> {
		return this.http.get<ChartData>(`${this.MOCK_DATA_PATH}gender-competency.mock.json`);
	}

	/**
	 * Get ESCO competency distribution chart data
	 * @returns Observable<ChartData>
	 */
	getEscoCompetencyData(): Observable<ChartData> {
		return this.http.get<ChartData>(`${this.MOCK_DATA_PATH}esco-competency.mock.json`);
	}

	/**
	 * Get badge competency data (top badges by count)
	 * @returns Observable<BadgeCompetencyData[]>
	 */
	getBadgeCompetencyData(): Observable<BadgeCompetencyData[]> {
		return this.http
			.get<any>(`${this.MOCK_DATA_PATH}badge-competency.mock.json`)
			.pipe(map((response) => response.data as any[]));
	}

	/**
	 * Get PLZ (postal code) distribution chart data
	 * @returns Observable<ChartData>
	 */
	getPlzDistributionData(): Observable<ChartData> {
		return this.http.get<ChartData>(`${this.MOCK_DATA_PATH}plz-distribution.mock.json`);
	}

	/**
	 * Get recent activities feed
	 * @returns Observable<ActivityItem[]>
	 */
	getRecentActivities(): Observable<ActivityItem[]> {
		return this.http.get<any>(`${this.MOCK_DATA_PATH}recent-activities.mock.json`).pipe(
			map(
				(response) =>
					response.data.map((item: any) => ({
						...item,
						date: new Date(item.date),
					})) as ActivityItem[],
			),
		);
	}

	/**
	 * Get available years for filtering
	 * @returns Observable<number[]>
	 */
	getAvailableYears(): Observable<number[]> {
		return this.getAllFilterOptions().pipe(map((options) => options.availableYears));
	}

	/**
	 * Get available months for filtering
	 * @returns Observable<{value: number, label: string}[]>
	 */
	getAvailableMonths(): Observable<{ value: number; label: string }[]> {
		return this.getAllFilterOptions().pipe(map((options) => options.availableMonths));
	}

	/**
	 * Get available badge types for filtering
	 * @returns Observable<{value: string, label: string}[]>
	 */
	getBadgeTypes(): Observable<{ value: string; label: string }[]> {
		return this.getAllFilterOptions().pipe(map((options) => options.badgeTypes));
	}

	/**
	 * Get all filter options at once
	 * @returns Observable with all filter options
	 */
	getAllFilterOptions(): Observable<{
		availableYears: number[];
		availableMonths: { value: number; label: string }[];
		badgeTypes: { value: string; label: string }[];
	}> {
		if (!this.filterOptionsCache$) {
			this.filterOptionsCache$ = this.http
				.get<any>(`${this.MOCK_DATA_PATH}filter-options.mock.json`)
				.pipe(shareReplay(1));
		}
		return this.filterOptionsCache$;
	}
}
