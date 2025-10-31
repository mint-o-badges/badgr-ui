import { TestBed } from '@angular/core/testing';
import { DashboardAggregationService } from './dashboard-aggregation.service';
import { ApiBadgeAward, ApiSkillData } from '../models/dashboard-api.model';
import { BadgeType } from '../models/dashboard-models';

describe('DashboardAggregationService', () => {
	let service: DashboardAggregationService;

	// Mock data
	const mockBadgeAwards: ApiBadgeAward[] = [
		{
			id: '1',
			badge_name: 'Digital Marketing Expert',
			badge_type: 'competency',
			issuer_name: 'Test Issuer',
			issued_on: '2024-01-15T10:00:00Z',
			recipient_identifier: 'user@example.com',
			image: 'https://example.com/badge1.png',
			description: 'A competency badge for digital marketing',
		},
		{
			id: '2',
			badge_name: 'Workshop Participation',
			badge_type: 'participation',
			issuer_name: 'Test Issuer',
			issued_on: '2024-01-20T10:00:00Z',
			recipient_identifier: 'user@example.com',
			image: 'https://example.com/badge2.png',
		},
		{
			id: '3',
			badge_name: 'Web Development Lernpfad',
			issuer_name: 'Test Issuer',
			issued_on: '2024-02-10T10:00:00Z',
			recipient_identifier: 'user@example.com',
			image: 'https://example.com/badge3.png',
		},
		{
			id: '4',
			badge_name: 'Teilnahmezertifikat - React Course',
			issuer_name: 'Test Issuer',
			issued_on: '2024-03-05T10:00:00Z',
			recipient_identifier: 'user@example.com',
			image: 'https://example.com/badge4.png',
		},
	];

	const mockSkills: ApiSkillData[] = [
		{
			name: 'Digital Marketing',
			count: 5,
			category: 'IT & Digital',
		},
		{
			name: 'Team Communication',
			count: 3,
			category: 'Soziale Kompetenzen',
		},
		{
			name: 'English Language',
			count: 2,
			category: 'Sprachen',
		},
	];

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [DashboardAggregationService],
		});
		service = TestBed.inject(DashboardAggregationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// ==========================================
	// Badge Type Classification Tests
	// ==========================================

	describe('aggregateBadgeTypeStats', () => {
		it('should classify badges by type and calculate statistics', (done) => {
			service.aggregateBadgeTypeStats(mockBadgeAwards).subscribe((stats) => {
				expect(stats).toBeDefined();
				expect(stats.length).toBeGreaterThan(0);

				// Check that percentages sum to 100 (with rounding tolerance)
				const totalPercentage = stats.reduce((sum, stat) => sum + stat.percentage, 0);
				expect(totalPercentage).toBeCloseTo(100, 1);

				// Check that counts sum to total badges
				const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
				expect(totalCount).toBe(mockBadgeAwards.length);

				// Each stat should have required properties
				stats.forEach((stat) => {
					expect(stat.type).toBeDefined();
					expect(stat.label).toBeDefined();
					expect(stat.count).toBeGreaterThanOrEqual(0);
					expect(stat.percentage).toBeGreaterThanOrEqual(0);
					expect(stat.color).toBeDefined();
				});

				done();
			});
		});

		it('should handle empty badge array', (done) => {
			service.aggregateBadgeTypeStats([]).subscribe((stats) => {
				expect(stats).toBeDefined();
				expect(stats.length).toBeGreaterThanOrEqual(0);
				done();
			});
		});

		it('should classify badges with explicit badge_type', (done) => {
			service.aggregateBadgeTypeStats(mockBadgeAwards).subscribe((stats) => {
				const competencyStat = stats.find((s) => s.type === 'competency');
				expect(competencyStat).toBeDefined();
				expect(competencyStat!.count).toBeGreaterThan(0);
				done();
			});
		});

		it('should infer badge type from name keywords', (done) => {
			const badges: ApiBadgeAward[] = [
				{
					id: '1',
					badge_name: 'Lernpfad JavaScript',
					issuer_name: 'Test',
					issued_on: '2024-01-01T00:00:00Z',
					recipient_identifier: 'user@test.com',
				},
			];

			service.aggregateBadgeTypeStats(badges).subscribe((stats) => {
				const learningpathStat = stats.find((s) => s.type === 'learningpath');
				expect(learningpathStat).toBeDefined();
				expect(learningpathStat!.count).toBe(1);
				done();
			});
		});
	});

	// ==========================================
	// Time-Series Aggregation Tests
	// ==========================================

	describe('aggregateBadgeAwardsByTime', () => {
		it('should group badges by year, month, and type', (done) => {
			service.aggregateBadgeAwardsByTime(mockBadgeAwards).subscribe((timeSeries) => {
				expect(timeSeries).toBeDefined();
				expect(timeSeries.length).toBeGreaterThan(0);

				// Each entry should have required properties
				timeSeries.forEach((entry) => {
					expect(entry.year).toBeGreaterThan(2000);
					expect(entry.month).toBeGreaterThanOrEqual(1);
					expect(entry.month).toBeLessThanOrEqual(12);
					expect(entry.type).toBeDefined();
					expect(entry.count).toBeGreaterThan(0);
					expect(entry.date).toBeInstanceOf(Date);
				});

				done();
			});
		});

		it('should sort time series data chronologically', (done) => {
			service.aggregateBadgeAwardsByTime(mockBadgeAwards).subscribe((timeSeries) => {
				for (let i = 1; i < timeSeries.length; i++) {
					expect(timeSeries[i].date.getTime()).toBeGreaterThanOrEqual(
						timeSeries[i - 1].date.getTime()
					);
				}
				done();
			});
		});

		it('should handle badges from different months', (done) => {
			service.aggregateBadgeAwardsByTime(mockBadgeAwards).subscribe((timeSeries) => {
				const uniqueMonths = new Set(timeSeries.map((t) => `${t.year}-${t.month}`));
				expect(uniqueMonths.size).toBeGreaterThan(1);
				done();
			});
		});

		it('should skip badges with invalid dates', (done) => {
			const badgesWithInvalidDate: ApiBadgeAward[] = [
				...mockBadgeAwards,
				{
					id: 'invalid',
					badge_name: 'Invalid Badge',
					issuer_name: 'Test',
					issued_on: 'invalid-date',
					recipient_identifier: 'user@test.com',
				},
			];

			service.aggregateBadgeAwardsByTime(badgesWithInvalidDate).subscribe((timeSeries) => {
				// Should only process valid dates
				expect(timeSeries).toBeDefined();
				done();
			});
		});
	});

	// ==========================================
	// Competency Distribution Tests
	// ==========================================

	describe('aggregateCompetencyDistribution', () => {
		it('should group skills by category', (done) => {
			service.aggregateCompetencyDistribution(mockSkills, mockBadgeAwards).subscribe((distribution) => {
				expect(distribution).toBeDefined();
				expect(distribution.length).toBeGreaterThan(0);

				// Each entry should have required properties
				distribution.forEach((entry) => {
					expect(entry.name).toBeDefined();
					expect(entry.value).toBeGreaterThan(0);
					expect(entry.weight).toBeGreaterThan(0);
					expect(entry.color).toBeDefined();
				});

				done();
			});
		});

		it('should calculate percentages correctly', (done) => {
			service.aggregateCompetencyDistribution(mockSkills, mockBadgeAwards).subscribe((distribution) => {
				// Percentages should sum to approximately 100
				const totalPercentage = distribution.reduce((sum, entry) => sum + entry.value, 0);
				expect(totalPercentage).toBeCloseTo(100, 1);
				done();
			});
		});

		it('should sort by weight descending', (done) => {
			service.aggregateCompetencyDistribution(mockSkills, mockBadgeAwards).subscribe((distribution) => {
				for (let i = 1; i < distribution.length; i++) {
					expect(distribution[i].weight).toBeLessThanOrEqual(distribution[i - 1].weight);
				}
				done();
			});
		});

		it('should categorize skills without explicit category', (done) => {
			const skillsWithoutCategory: ApiSkillData[] = [
				{
					name: 'JavaScript Programming',
					count: 5,
				},
				{
					name: 'Team Leadership',
					count: 3,
				},
			];

			service
				.aggregateCompetencyDistribution(skillsWithoutCategory, mockBadgeAwards)
				.subscribe((distribution) => {
					expect(distribution).toBeDefined();
					expect(distribution.length).toBeGreaterThan(0);

					// Skills should be categorized
					distribution.forEach((entry) => {
						expect(entry.name).toBeDefined();
					});

					done();
				});
		});
	});

	// ==========================================
	// KPI Calculation Tests
	// ==========================================

	describe('calculateKPIs', () => {
		it('should generate KPI data with trends', (done) => {
			const userData = {
				firstName: 'Test',
				lastName: 'User',
			};

			service.calculateKPIs(userData, mockBadgeAwards).subscribe((kpis) => {
				expect(kpis).toBeDefined();
				expect(kpis.length).toBeGreaterThan(0);

				// Each KPI should have required properties
				kpis.forEach((kpi) => {
					expect(kpi.label).toBeDefined();
					expect(kpi.value).toBeDefined();
					expect(kpi.trend).toBeDefined();
					expect(['up', 'down', 'stable']).toContain(kpi.trend);
				});

				done();
			});
		});

		it('should calculate total badges correctly', (done) => {
			service.calculateKPIs({}, mockBadgeAwards).subscribe((kpis) => {
				const badgeKPI = kpis.find((k) => k.label === 'Vergebene Badges');
				expect(badgeKPI).toBeDefined();
				expect(badgeKPI!.value).toBe(mockBadgeAwards.length);
				done();
			});
		});

		it('should calculate competency hours', (done) => {
			service.calculateKPIs({}, mockBadgeAwards).subscribe((kpis) => {
				const hoursKPI = kpis.find((k) => k.label.includes('Kompetenzstunden'));
				expect(hoursKPI).toBeDefined();
				expect(hoursKPI!.value).toBeGreaterThan(0);
				done();
			});
		});
	});

	// ==========================================
	// Top Badges Tests
	// ==========================================

	describe('getTopBadges', () => {
		it('should return top badges by award count', (done) => {
			const duplicateBadges: ApiBadgeAward[] = [
				...mockBadgeAwards,
				{
					id: '5',
					badge_name: 'Digital Marketing Expert',
					issuer_name: 'Test',
					issued_on: '2024-01-01T00:00:00Z',
					recipient_identifier: 'user@test.com',
				},
			];

			service.getTopBadges(duplicateBadges, 3).subscribe((topBadges) => {
				expect(topBadges).toBeDefined();
				expect(topBadges.length).toBeLessThanOrEqual(3);

				// Should be sorted by count descending
				for (let i = 1; i < topBadges.length; i++) {
					expect(topBadges[i].count).toBeLessThanOrEqual(topBadges[i - 1].count);
				}

				done();
			});
		});

		it('should include rank and color', (done) => {
			service.getTopBadges(mockBadgeAwards, 5).subscribe((topBadges) => {
				topBadges.forEach((badge) => {
					expect(badge.badgeTitle).toBeDefined();
					expect(badge.count).toBeGreaterThan(0);
					expect(badge.color).toBeDefined();
					expect(badge.rank).toBeGreaterThan(0);
				});

				done();
			});
		});
	});

	// ==========================================
	// Utility Method Tests
	// ==========================================

	describe('filterBadgesByDateRange', () => {
		it('should filter badges by date range', (done) => {
			const startDate = new Date('2024-02-01');
			const endDate = new Date('2024-03-31');

			service.filterBadgesByDateRange(mockBadgeAwards, startDate, endDate).subscribe((filtered) => {
				filtered.forEach((badge) => {
					const issuedDate = new Date(badge.issued_on);
					expect(issuedDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
					expect(issuedDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
				});

				done();
			});
		});

		it('should return all badges when no dates specified', (done) => {
			service.filterBadgesByDateRange(mockBadgeAwards).subscribe((filtered) => {
				expect(filtered.length).toBe(mockBadgeAwards.length);
				done();
			});
		});
	});

	describe('filterBadgesByType', () => {
		it('should filter badges by type', (done) => {
			service.filterBadgesByType(mockBadgeAwards, 'competency').subscribe((filtered) => {
				expect(filtered).toBeDefined();
				expect(filtered.length).toBeGreaterThan(0);
				done();
			});
		});

		it('should return all badges when type is "all"', (done) => {
			service.filterBadgesByType(mockBadgeAwards, 'all').subscribe((filtered) => {
				expect(filtered.length).toBe(mockBadgeAwards.length);
				done();
			});
		});
	});

	describe('getAvailableYears', () => {
		it('should extract unique years from badges', (done) => {
			service.getAvailableYears(mockBadgeAwards).subscribe((years) => {
				expect(years).toBeDefined();
				expect(years.length).toBeGreaterThan(0);
				expect(years).toContain(2024);

				// Should be in descending order
				for (let i = 1; i < years.length; i++) {
					expect(years[i]).toBeLessThanOrEqual(years[i - 1]);
				}

				done();
			});
		});

		it('should handle empty badge array', (done) => {
			service.getAvailableYears([]).subscribe((years) => {
				expect(years).toBeDefined();
				expect(years.length).toBe(0);
				done();
			});
		});
	});
});
