import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BadgeType, BadgeTypeStats, BadgeAwardData, CompetencyBubbleData, KPIData } from '../models/dashboard-models';
import { ApiBadgeAward, ApiSkillData } from '../models/dashboard-api.model';

/**
 * Dashboard Aggregation Service
 *
 * Client-side data aggregation service that processes raw badge data from the API
 * into the statistics and visualizations needed by the dashboard components.
 *
 * This service:
 * - Does NOT extend BaseHttpApiService (it's pure aggregation logic)
 * - Uses RxJS Observables for reactive data flow
 * - Implements algorithms for badge classification, time-series aggregation, and competency analysis
 * - Provides the data transformations currently hardcoded in MunicipalDashboardComponent
 *
 * Usage:
 * ```typescript
 * constructor(private aggregationService: DashboardAggregationService) {}
 *
 * // Transform API badge awards into type statistics
 * this.aggregationService.aggregateBadgeTypeStats(badgeAwards)
 *   .subscribe(stats => this.badgeTypeStats = stats);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DashboardAggregationService {
	// OEB Color Palette (matching dashboard theme)
	private readonly OEB_COLORS = {
		blau: '#492E98',
		kiLila: '#CCD7FF',
		gruen: '#93F993',
		mint: '#E4FFE4',
		pink: '#FFBAB9',
		darkGrey: '#757575',
	};

	// Badge type labels (German)
	private readonly BADGE_TYPE_LABELS: Record<BadgeType, string> = {
		competency: 'Teilnahmezertifikat',
		participation: 'Badge',
		learningpath: 'Micro Degrees',
	};

	// Badge type colors (matching OEB theme)
	private readonly BADGE_TYPE_COLORS: Record<BadgeType, string> = {
		competency: this.OEB_COLORS.kiLila,
		participation: this.OEB_COLORS.mint,
		learningpath: this.OEB_COLORS.pink,
	};

	// Competency category color mapping
	private readonly COMPETENCY_COLORS: Record<string, string> = {
		'IT & Digital': this.OEB_COLORS.blau,
		'Soziale Kompetenzen': this.OEB_COLORS.blau,
		Sprachen: this.OEB_COLORS.kiLila,
		Handwerk: this.OEB_COLORS.gruen,
		Management: this.OEB_COLORS.mint,
		Andere: this.OEB_COLORS.darkGrey,
	};

	constructor() {}

	// ==========================================
	// Badge Type Classification & Statistics
	// ==========================================

	/**
	 * Aggregate badge type statistics from raw badge awards
	 *
	 * Classifies badges by type and calculates counts and percentages.
	 *
	 * @param badges - Array of badge awards from the API
	 * @returns Observable of badge type statistics
	 */
	aggregateBadgeTypeStats(badges: ApiBadgeAward[]): Observable<BadgeTypeStats[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				// Classify badges by type
				const classified = this.classifyBadgesByType(badgeArray);

				// Calculate statistics for each type
				const total = badgeArray.length || 1; // Prevent division by zero
				const stats: BadgeTypeStats[] = [];

				for (const [type, badgeList] of classified.entries()) {
					const count = badgeList.length;
					const percentage = (count / total) * 100;

					stats.push({
						type: type as BadgeType,
						label: this.BADGE_TYPE_LABELS[type as BadgeType],
						count,
						percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
						color: this.BADGE_TYPE_COLORS[type as BadgeType],
					});
				}

				// Sort by count descending
				return stats.sort((a, b) => b.count - a.count);
			}),
		);
	}

	/**
	 * Classify badges by type using multiple heuristics
	 *
	 * Classification algorithm:
	 * 1. Check badge_type field if present
	 * 2. Analyze badge name for keywords
	 * 3. Check description for type indicators
	 * 4. Default to 'participation' if ambiguous
	 *
	 * @param badges - Array of badge awards
	 * @returns Map of badge type to badge arrays
	 */
	private classifyBadgesByType(badges: ApiBadgeAward[]): Map<string, ApiBadgeAward[]> {
		const classified = new Map<string, ApiBadgeAward[]>([
			['competency', []],
			['participation', []],
			['learningpath', []],
		]);

		for (const badge of badges) {
			const type = this.determineBadgeType(badge);
			classified.get(type)?.push(badge);
		}

		return classified;
	}

	/**
	 * Determine the type of a single badge
	 *
	 * @param badge - Badge award to classify
	 * @returns Badge type classification
	 */
	private determineBadgeType(badge: ApiBadgeAward): BadgeType {
		// Priority 1: Explicit badge_type field
		if (badge.badge_type) {
			return badge.badge_type;
		}

		const name = badge.badge_name?.toLowerCase() || '';
		const description = badge.description?.toLowerCase() || '';

		// Priority 2: Name-based classification
		// Competency indicators
		if (
			name.includes('teilnahme') ||
			name.includes('zertifikat') ||
			name.includes('competency') ||
			name.includes('certificate')
		) {
			return 'competency';
		}

		// Learning path indicators
		if (
			name.includes('lernpfad') ||
			name.includes('learning path') ||
			name.includes('micro degree') ||
			name.includes('course') ||
			name.includes('kurs')
		) {
			return 'learningpath';
		}

		// Priority 3: Description-based classification
		if (description.includes('kompetenz') || description.includes('competency') || description.includes('skill')) {
			return 'competency';
		}

		if (description.includes('participation') || description.includes('teilnahme')) {
			return 'participation';
		}

		// Default: Participation badge
		return 'participation';
	}

	// ==========================================
	// Time-Series Aggregation
	// ==========================================

	/**
	 * Aggregate badge awards by time (year/month) and type
	 *
	 * Creates time-series data suitable for line charts showing badge distribution over time.
	 *
	 * @param badges - Array of badge awards from the API
	 * @returns Observable of time-series badge award data
	 */
	aggregateBadgeAwardsByTime(badges: ApiBadgeAward[]): Observable<BadgeAwardData[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				// Group badges by year, month, and type
				const timeMap = new Map<string, BadgeAwardData>();

				for (const badge of badgeArray) {
					const issuedDate = new Date(badge.issued_on);
					if (isNaN(issuedDate.getTime())) {
						continue; // Skip invalid dates
					}

					const year = issuedDate.getFullYear();
					const month = issuedDate.getMonth() + 1; // 1-based month
					const type = this.determineBadgeType(badge);

					// Create unique key for year-month-type combination
					const key = `${year}-${month}-${type}`;

					if (timeMap.has(key)) {
						// Increment count for existing entry
						const existing = timeMap.get(key)!;
						existing.count++;
					} else {
						// Create new entry
						timeMap.set(key, {
							year,
							month,
							type,
							count: 1,
							date: new Date(year, month - 1, 1), // First day of month
						});
					}
				}

				// Convert map to sorted array
				const timeSeriesData = Array.from(timeMap.values());

				// Sort by date ascending
				return timeSeriesData.sort((a, b) => a.date.getTime() - b.date.getTime());
			}),
		);
	}

	// ==========================================
	// Competency Distribution
	// ==========================================

	/**
	 * Aggregate competency distribution from skills data
	 *
	 * Groups skills by category and calculates weighted distribution for bubble charts.
	 *
	 * @param skills - Array of skill data from the API
	 * @param badges - Array of badge awards (for additional context)
	 * @returns Observable of competency bubble data
	 */
	aggregateCompetencyDistribution(
		skills: ApiSkillData[],
		badges: ApiBadgeAward[],
	): Observable<CompetencyBubbleData[]> {
		return of(skills).pipe(
			map((skillArray) => {
				// Group skills by category
				const categoryMap = new Map<string, number>();

				for (const skill of skillArray) {
					const category = skill.category || this.categorizeSkill(skill.name);
					const count = skill.count || 1;

					if (categoryMap.has(category)) {
						categoryMap.set(category, categoryMap.get(category)! + count);
					} else {
						categoryMap.set(category, count);
					}
				}

				// Calculate total for percentage calculation
				const total = Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0) || 1;

				// Convert to bubble data
				const bubbleData: CompetencyBubbleData[] = [];

				for (const [category, count] of categoryMap.entries()) {
					const percentage = (count / total) * 100;
					bubbleData.push({
						name: category,
						value: Math.round(percentage * 10) / 10,
						weight: count,
						color: this.COMPETENCY_COLORS[category] || this.OEB_COLORS.darkGrey,
					});
				}

				// Sort by weight descending
				return bubbleData.sort((a, b) => b.weight - a.weight);
			}),
		);
	}

	/**
	 * Categorize a skill by name when category is not provided
	 *
	 * @param skillName - Name of the skill
	 * @returns Category name
	 */
	private categorizeSkill(skillName: string): string {
		const name = skillName.toLowerCase();

		if (
			name.includes('digital') ||
			name.includes('it') ||
			name.includes('software') ||
			name.includes('programming') ||
			name.includes('data')
		) {
			return 'IT & Digital';
		}

		if (
			name.includes('kommunikation') ||
			name.includes('team') ||
			name.includes('social') ||
			name.includes('leadership')
		) {
			return 'Soziale Kompetenzen';
		}

		if (
			name.includes('sprache') ||
			name.includes('language') ||
			name.includes('english') ||
			name.includes('deutsch')
		) {
			return 'Sprachen';
		}

		if (
			name.includes('handwerk') ||
			name.includes('craft') ||
			name.includes('technical') ||
			name.includes('mechanisch')
		) {
			return 'Handwerk';
		}

		if (
			name.includes('management') ||
			name.includes('planung') ||
			name.includes('strategie') ||
			name.includes('projekt')
		) {
			return 'Management';
		}

		return 'Andere';
	}

	// ==========================================
	// KPI Calculations
	// ==========================================

	/**
	 * Calculate KPIs from raw user and badge data
	 *
	 * Generates key performance indicators with trends and statistics.
	 *
	 * @param userData - User profile and statistics
	 * @param badges - Array of badge awards
	 * @returns Observable of KPI data array
	 */
	calculateKPIs(userData: any, badges: ApiBadgeAward[]): Observable<KPIData[]> {
		return of({ userData, badges }).pipe(
			map(({ userData, badges: badgeArray }) => {
				const kpis: KPIData[] = [];

				// Total badges KPI
				const totalBadges = badgeArray.length;
				const previousMonthBadges = this.getBadgesFromPreviousMonth(badgeArray);
				const badgeTrend = totalBadges - previousMonthBadges;

				kpis.push({
					label: 'Vergebene Badges',
					value: totalBadges,
					unit: 'Badges',
					trend: badgeTrend > 0 ? 'up' : badgeTrend < 0 ? 'down' : 'stable',
					trendValue: Math.abs(badgeTrend),
					trendLabel: `${badgeTrend > 0 ? '+' : ''}${badgeTrend} im letzten Monat`,
					icon: 'lucideAward',
					color: 'text-purple-600',
				});

				// Calculate competency hours (example calculation)
				const competencyHours = this.calculateCompetencyHours(badgeArray);
				kpis.push({
					label: 'Kompetenzstunden insgesamt',
					value: competencyHours,
					unit: 'Stunden',
					trend: 'up',
					trendValue: Math.round(competencyHours * 0.08), // Example: 8% growth
					trendLabel: `+${Math.round(competencyHours * 0.08)} im letzten Monat`,
					icon: 'lucideBookOpen',
					color: 'text-purple-600',
					tooltip: 'Anzahl der Kompetenz in Stunden, welche die Badges insgesamt erhalten',
				});

				return kpis;
			}),
		);
	}

	/**
	 * Count badges from the previous month for trend calculation
	 *
	 * @param badges - Array of badge awards
	 * @returns Number of badges from previous month
	 */
	private getBadgesFromPreviousMonth(badges: ApiBadgeAward[]): number {
		const now = new Date();
		const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

		return badges.filter((badge) => {
			const issuedDate = new Date(badge.issued_on);
			return issuedDate >= previousMonth && issuedDate <= previousMonthEnd;
		}).length;
	}

	/**
	 * Calculate total competency hours from badges
	 *
	 * Estimates learning hours based on badge types and descriptions.
	 *
	 * @param badges - Array of badge awards
	 * @returns Total estimated competency hours
	 */
	private calculateCompetencyHours(badges: ApiBadgeAward[]): number {
		// Simple heuristic: different badge types have different hour values
		const hoursByType: Record<BadgeType, number> = {
			competency: 8, // Competency badges ~ 8 hours
			participation: 2, // Participation badges ~ 2 hours
			learningpath: 20, // Learning paths ~ 20 hours
		};

		let totalHours = 0;

		for (const badge of badges) {
			const type = this.determineBadgeType(badge);
			totalHours += hoursByType[type];
		}

		return totalHours;
	}

	// ==========================================
	// Top Badges Ranking
	// ==========================================

	/**
	 * Get top N badges by award count
	 *
	 * Ranks badges by how frequently they've been awarded.
	 *
	 * @param badges - Array of badge awards
	 * @param limit - Number of top badges to return
	 * @returns Observable of top badge data
	 */
	getTopBadges(badges: ApiBadgeAward[], limit: number = 6): Observable<any[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				// Group badges by badge name
				const badgeMap = new Map<string, { name: string; count: number; type: BadgeType }>();

				for (const badge of badgeArray) {
					const name = badge.badge_name;
					const type = this.determineBadgeType(badge);

					if (badgeMap.has(name)) {
						badgeMap.get(name)!.count++;
					} else {
						badgeMap.set(name, { name, count: 1, type });
					}
				}

				// Convert to array and sort by count
				const topBadges = Array.from(badgeMap.values())
					.sort((a, b) => b.count - a.count)
					.slice(0, limit);

				// Format for horizontal bar chart
				return topBadges.map((badge, index) => ({
					badgeTitle: badge.name,
					count: badge.count,
					color: this.BADGE_TYPE_COLORS[badge.type],
					rank: index + 1,
				}));
			}),
		);
	}

	// ==========================================
	// Utility Methods
	// ==========================================

	/**
	 * Filter badges by date range
	 *
	 * @param badges - Array of badge awards
	 * @param startDate - Start date (inclusive)
	 * @param endDate - End date (inclusive)
	 * @returns Filtered badge array
	 */
	filterBadgesByDateRange(badges: ApiBadgeAward[], startDate?: Date, endDate?: Date): Observable<ApiBadgeAward[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				if (!startDate && !endDate) {
					return badgeArray;
				}

				return badgeArray.filter((badge) => {
					const issuedDate = new Date(badge.issued_on);

					if (startDate && issuedDate < startDate) {
						return false;
					}

					if (endDate && issuedDate > endDate) {
						return false;
					}

					return true;
				});
			}),
		);
	}

	/**
	 * Filter badges by type
	 *
	 * @param badges - Array of badge awards
	 * @param type - Badge type to filter by
	 * @returns Filtered badge array
	 */
	filterBadgesByType(badges: ApiBadgeAward[], type: BadgeType | 'all'): Observable<ApiBadgeAward[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				if (type === 'all') {
					return badgeArray;
				}

				return badgeArray.filter((badge) => this.determineBadgeType(badge) === type);
			}),
		);
	}

	/**
	 * Get unique years from badge awards
	 *
	 * @param badges - Array of badge awards
	 * @returns Array of unique years
	 */
	getAvailableYears(badges: ApiBadgeAward[]): Observable<number[]> {
		return of(badges).pipe(
			map((badgeArray) => {
				const years = new Set<number>();

				for (const badge of badgeArray) {
					const issuedDate = new Date(badge.issued_on);
					if (!isNaN(issuedDate.getTime())) {
						years.add(issuedDate.getFullYear());
					}
				}

				return Array.from(years).sort((a, b) => b - a); // Descending order
			}),
		);
	}
}
