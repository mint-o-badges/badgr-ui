import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardDataService } from './dashboard-data.service';
import { DashboardApiService } from './dashboard-api.service';
import {
	ApiBadgeStatistics,
	ApiUserProfile,
	ApiSkillsDistribution,
	ApiBadgeAwardsResponse,
	ApiActivityFeedResponse,
} from '../models/dashboard-api.model';
import { BadgeTypeStats, KPIData, CompetencyBubbleData, ActivityItem } from '../models/dashboard-models';

describe('DashboardDataService', () => {
	let service: DashboardDataService;
	let mockDashboardApi: jasmine.SpyObj<DashboardApiService>;

	// Mock data
	const mockBadgeStats: ApiBadgeStatistics = {
		total: 100,
		participation: 50,
		competency: 30,
		learningpath: 20,
		by_year: { '2024': 100 },
		by_month: { '2024-10': 100 },
	};

	const mockUserProfile: ApiUserProfile = {
		first_name: 'John',
		last_name: 'Doe',
		email: 'john@example.com',
		agreed_terms_version: 1,
		latest_terms_version: 1,
	};

	const mockSkillsDistribution: ApiSkillsDistribution = {
		skills: [
			{ name: 'JavaScript', count: 25, percentage: 25 },
			{ name: 'Python', count: 20, percentage: 20 },
			{ name: 'TypeScript', count: 15, percentage: 15 },
			{ name: 'React', count: 10, percentage: 10 },
			{ name: 'Angular', count: 10, percentage: 10 },
		],
		total_skills: 80,
		total_badges_with_skills: 50,
	};

	const mockBadgeAwards: ApiBadgeAwardsResponse = {
		results: [
			{
				id: '1',
				badge_name: 'JavaScript Expert',
				badge_type: 'competency',
				issuer_name: 'Tech Academy',
				issued_on: '2024-10-01T10:00:00Z',
				recipient_identifier: 'john@example.com',
			},
			{
				id: '2',
				badge_name: 'Python Master',
				badge_type: 'competency',
				issuer_name: 'Code School',
				issued_on: '2024-10-15T10:00:00Z',
				recipient_identifier: 'john@example.com',
			},
		],
		count: 2,
	};

	const mockActivityFeed: ApiActivityFeedResponse = {
		results: [
			{
				type: 'badge_issued',
				title: 'JavaScript Expert Badge Earned',
				timestamp: '2024-10-01T10:00:00Z',
			},
			{
				type: 'skill_added',
				title: 'New Skill: TypeScript',
				timestamp: '2024-10-02T10:00:00Z',
			},
		],
		count: 2,
	};

	beforeEach(() => {
		// Create spy object for DashboardApiService
		mockDashboardApi = jasmine.createSpyObj('DashboardApiService', [
			'getBadgeStatistics',
			'getUserProfile',
			'getSkillsDistribution',
			'getBadgeAwards',
			'getActivityFeed',
		]);

		TestBed.configureTestingModule({
			providers: [DashboardDataService, { provide: DashboardApiService, useValue: mockDashboardApi }],
		});

		service = TestBed.inject(DashboardDataService);
	});

	afterEach(() => {
		// Clear cache after each test
		service.clearCache();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getDashboardOverview', () => {
		it('should load and combine all dashboard data', (done) => {
			// Setup mocks
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.resolve(mockUserProfile));
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.resolve(mockSkillsDistribution));
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.resolve(mockActivityFeed));

			// Execute
			service.getDashboardOverview().subscribe({
				next: (overview) => {
					// Verify structure
					expect(overview).toBeDefined();
					expect(overview.kpis).toBeDefined();
					expect(overview.badgeStatistics).toBeDefined();
					expect(overview.competencyData).toBeDefined();
					expect(overview.activityFeed).toBeDefined();
					expect(overview.lastUpdated).toBeInstanceOf(Date);

					// Verify KPIs
					expect(overview.kpis.length).toBeGreaterThan(0);
					expect(overview.kpis[0].label).toBe('Total Badges');
					expect(overview.kpis[0].value).toBe(100);

					// Verify all API methods were called
					expect(mockDashboardApi.getBadgeStatistics).toHaveBeenCalled();
					expect(mockDashboardApi.getUserProfile).toHaveBeenCalled();
					expect(mockDashboardApi.getSkillsDistribution).toHaveBeenCalled();
					expect(mockDashboardApi.getActivityFeed).toHaveBeenCalledWith(10);

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});

		it('should handle API errors gracefully', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.reject({ status: 500 }));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.reject({ status: 500 }));
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.reject({ status: 500 }));
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.reject({ status: 500 }));

			service.getDashboardOverview().subscribe({
				next: () => fail('Should have thrown error'),
				error: (error) => {
					expect(error).toBeDefined();
					expect(error.type).toBeDefined();
					done();
				},
			});
		});
	});

	describe('getBadgeTypeStatistics', () => {
		it('should return badge type stats with percentages', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));

			service.getBadgeTypeStatistics().subscribe({
				next: (stats) => {
					expect(stats).toBeDefined();
					expect(stats.length).toBe(3);

					// Verify participation badge
					const participationStat = stats.find((s) => s.type === 'participation');
					expect(participationStat).toBeDefined();
					expect(participationStat!.count).toBe(50);
					expect(participationStat!.percentage).toBe(50);
					expect(participationStat!.label).toBe('Teilnahme');
					expect(participationStat!.color).toBeDefined();

					// Verify competency badge
					const competencyStat = stats.find((s) => s.type === 'competency');
					expect(competencyStat).toBeDefined();
					expect(competencyStat!.count).toBe(30);
					expect(competencyStat!.percentage).toBe(30);

					// Verify learning path badge
					const learningPathStat = stats.find((s) => s.type === 'learningpath');
					expect(learningPathStat).toBeDefined();
					expect(learningPathStat!.count).toBe(20);
					expect(learningPathStat!.percentage).toBe(20);

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});

		it('should cache results', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));

			// First call
			service.getBadgeTypeStatistics().subscribe(() => {
				// Second call should use cache
				service.getBadgeTypeStatistics().subscribe(() => {
					// API should only be called once
					expect(mockDashboardApi.getBadgeStatistics).toHaveBeenCalledTimes(1);
					done();
				});
			});
		});

		it('should return empty array on error with fallback', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.reject({ status: 404 }));

			service.getBadgeTypeStatistics().subscribe({
				next: (stats) => {
					expect(stats).toEqual([]);
					done();
				},
				error: () => {
					fail('Should use fallback instead of error');
					done();
				},
			});
		});
	});

	describe('getBadgeAwardsTimeSeries', () => {
		it('should transform badge awards into time series data', (done) => {
			mockDashboardApi.getBadgeAwards.and.returnValue(Promise.resolve(mockBadgeAwards));

			service.getBadgeAwardsTimeSeries().subscribe({
				next: (timeSeries) => {
					expect(timeSeries).toBeDefined();
					expect(timeSeries.length).toBeGreaterThan(0);

					// Verify structure
					const firstEntry = timeSeries[0];
					expect(firstEntry.year).toBeDefined();
					expect(firstEntry.month).toBeDefined();
					expect(firstEntry.type).toBeDefined();
					expect(firstEntry.count).toBeGreaterThan(0);
					expect(firstEntry.date).toBeInstanceOf(Date);

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});

		it('should accept filter parameters', (done) => {
			mockDashboardApi.getBadgeAwards.and.returnValue(Promise.resolve(mockBadgeAwards));

			const params = { year: 2024, month: 10, type: 'competency' as const };
			service.getBadgeAwardsTimeSeries(params).subscribe({
				next: () => {
					expect(mockDashboardApi.getBadgeAwards).toHaveBeenCalledWith(params);
					done();
				},
			});
		});
	});

	describe('getCompetencyDistribution', () => {
		it('should transform skills into competency bubbles', (done) => {
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.resolve(mockSkillsDistribution));

			service.getCompetencyDistribution().subscribe({
				next: (bubbles) => {
					expect(bubbles).toBeDefined();
					expect(bubbles.length).toBeGreaterThan(0);
					expect(bubbles.length).toBeLessThanOrEqual(10); // Max 10 bubbles

					// Verify structure
					const firstBubble = bubbles[0];
					expect(firstBubble.name).toBeDefined();
					expect(firstBubble.value).toBeGreaterThan(0);
					expect(firstBubble.weight).toBeGreaterThan(0);
					expect(firstBubble.color).toBeDefined();

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});
	});

	describe('getTopKPIs', () => {
		it('should return KPI data with all required fields', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.resolve(mockUserProfile));

			service.getTopKPIs().subscribe({
				next: (kpis) => {
					expect(kpis).toBeDefined();
					expect(kpis.length).toBeGreaterThan(0);

					// Verify KPI structure
					const totalBadgesKPI = kpis.find((k) => k.label === 'Total Badges');
					expect(totalBadgesKPI).toBeDefined();
					expect(totalBadgesKPI!.value).toBe(100);
					expect(totalBadgesKPI!.unit).toBe('badges');
					expect(totalBadgesKPI!.trend).toBeDefined();
					expect(totalBadgesKPI!.icon).toBeDefined();
					expect(totalBadgesKPI!.color).toBeDefined();
					expect(totalBadgesKPI!.tooltip).toBeDefined();

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});
	});

	describe('getTopBadges', () => {
		it('should return top badges sorted by count', (done) => {
			mockDashboardApi.getBadgeAwards.and.returnValue(Promise.resolve(mockBadgeAwards));

			service.getTopBadges(5).subscribe({
				next: (topBadges) => {
					expect(topBadges).toBeDefined();
					expect(topBadges.length).toBeGreaterThan(0);

					// Verify structure
					const firstBadge = topBadges[0];
					expect(firstBadge.badgeTitle).toBeDefined();
					expect(firstBadge.count).toBeGreaterThan(0);
					expect(firstBadge.color).toBeDefined();

					// Verify API was called with limit
					expect(mockDashboardApi.getBadgeAwards).toHaveBeenCalledWith({ limit: 5 });

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});
	});

	describe('getRecentActivity', () => {
		it('should return activity items', (done) => {
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.resolve(mockActivityFeed));

			service.getRecentActivity(10).subscribe({
				next: (activities) => {
					expect(activities).toBeDefined();
					expect(activities.length).toBe(2);

					// Verify structure
					const firstActivity = activities[0];
					expect(firstActivity.type).toBeDefined();
					expect(firstActivity.title).toBeDefined();
					expect(firstActivity.date).toBeInstanceOf(Date);
					expect(firstActivity.icon).toBeDefined();

					done();
				},
				error: (error) => {
					fail('Should not error: ' + error);
					done();
				},
			});
		});
	});

	describe('Cache Management', () => {
		it('should cache data with TTL', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));

			service.getBadgeTypeStatistics().subscribe(() => {
				// Verify cache is valid
				expect(service.isCacheValid('badge-type-stats')).toBe(true);
				done();
			});
		});

		it('should clear all cache', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));

			service.getBadgeTypeStatistics().subscribe(() => {
				// Clear cache
				service.clearCache();

				// Verify cache is no longer valid
				expect(service.isCacheValid('badge-type-stats')).toBe(false);
				done();
			});
		});

		it('should refresh data and clear cache', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.resolve(mockBadgeStats));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.resolve(mockUserProfile));
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.resolve(mockSkillsDistribution));
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.resolve(mockActivityFeed));

			// Load initial data
			service.getDashboardOverview().subscribe(() => {
				const cacheKey = 'overview-{}';
				expect(service.isCacheValid(cacheKey)).toBe(true);

				// Refresh
				service.refreshData().subscribe(() => {
					// API should be called again
					expect(mockDashboardApi.getBadgeStatistics).toHaveBeenCalledTimes(2);
					done();
				});
			});
		});
	});

	describe('Error Handling', () => {
		it('should classify authentication errors', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.reject({ status: 401 }));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.reject({ status: 401 }));
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.reject({ status: 401 }));
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.reject({ status: 401 }));

			service.getDashboardOverview().subscribe({
				next: () => fail('Should have thrown error'),
				error: (error) => {
					expect(error.type).toBe('AUTHENTICATION_FAILED');
					done();
				},
			});
		});

		it('should classify network errors', (done) => {
			mockDashboardApi.getBadgeStatistics.and.returnValue(Promise.reject({ status: 0 }));
			mockDashboardApi.getUserProfile.and.returnValue(Promise.reject({ status: 0 }));
			mockDashboardApi.getSkillsDistribution.and.returnValue(Promise.reject({ status: 0 }));
			mockDashboardApi.getActivityFeed.and.returnValue(Promise.reject({ status: 0 }));

			service.getDashboardOverview().subscribe({
				next: () => fail('Should have thrown error'),
				error: (error) => {
					expect(error.type).toBe('API_UNAVAILABLE');
					done();
				},
			});
		});

		it('should provide fallback data when available', (done) => {
			mockDashboardApi.getBadgeAwards.and.returnValue(Promise.reject({ status: 500 }));

			service.getTopBadges(5).subscribe({
				next: (data) => {
					expect(data).toEqual([]);
					done();
				},
				error: () => {
					fail('Should use fallback instead of error');
					done();
				},
			});
		});
	});
});
