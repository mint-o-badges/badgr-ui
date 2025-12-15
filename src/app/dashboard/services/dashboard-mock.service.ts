import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiBadgeStatistics, ApiActivityFeedResponse } from '../models/dashboard-api.model';

/**
 * Dashboard Mock Data Service
 *
 * Provides mock data for dashboard endpoints that are not yet implemented
 * in the badgr-server backend. This service serves as a fallback when
 * API calls fail with 404 errors.
 *
 * Usage:
 * - Automatically used by DashboardApiService when endpoints return 404
 * - Can be used directly for testing and development
 * - Mock data is stored in JSON files for easy maintenance
 *
 * Data Sources:
 * - badge-statistics.mock.json: Badge counts and temporal distribution
 * - activity-feed.mock.json: Recent user activities and events
 */
@Injectable({ providedIn: 'root' })
export class DashboardMockService {
	// ==========================================
	// Mock Data - Loaded from JSON files
	// ==========================================

	private readonly badgeStatisticsMock: ApiBadgeStatistics = {
		total: 45,
		participation: 20,
		competency: 18,
		learningpath: 7,
		by_year: {
			'2024': 28,
			'2023': 17,
		},
		by_month: {
			'2024-10': 5,
			'2024-09': 8,
			'2024-08': 6,
			'2024-07': 4,
			'2024-06': 3,
			'2024-05': 2,
		},
	};

	private readonly activityFeedMock: ApiActivityFeedResponse = {
		count: 25,
		next: null,
		previous: null,
		results: [
			{
				id: 'act_001',
				type: 'badge_issued',
				title: 'Earned Digital Competencies Badge',
				description: 'Successfully completed digital competencies assessment',
				timestamp: '2024-10-25T14:30:00Z',
				metadata: {
					badge_name: 'Digital Competencies',
					issuer: 'University of Example',
				},
			},
			{
				id: 'act_002',
				type: 'collection_created',
				title: 'Created 2024 Professional Development Collection',
				description: 'New collection for organizing professional badges',
				timestamp: '2024-10-20T09:15:00Z',
				metadata: {
					collection_name: '2024 Professional Development',
				},
			},
			{
				id: 'act_003',
				type: 'badge_issued',
				title: 'Earned Leadership Skills Badge',
				description: 'Demonstrated leadership competencies in team management',
				timestamp: '2024-10-18T16:45:00Z',
				metadata: {
					badge_name: 'Leadership Skills',
					issuer: 'Professional Training Institute',
				},
			},
			{
				id: 'act_004',
				type: 'skill_added',
				title: 'Added Project Management Skill',
				description: 'New competency alignment added to profile',
				timestamp: '2024-10-15T11:20:00Z',
				metadata: {
					skill_name: 'Project Management',
					framework: 'ESCO',
				},
			},
			{
				id: 'act_005',
				type: 'badge_issued',
				title: 'Earned Communication Excellence Badge',
				description: 'Completed advanced communication skills workshop',
				timestamp: '2024-10-12T13:00:00Z',
				metadata: {
					badge_name: 'Communication Excellence',
					issuer: 'Business School',
				},
			},
			{
				id: 'act_006',
				type: 'badge_shared',
				title: 'Shared Data Analysis Badge on LinkedIn',
				description: 'Badge shared to professional network',
				timestamp: '2024-10-10T08:30:00Z',
				metadata: {
					badge_name: 'Data Analysis',
					platform: 'LinkedIn',
				},
			},
			{
				id: 'act_007',
				type: 'badge_issued',
				title: 'Earned Teamwork Participation Badge',
				description: 'Active participation in team collaboration project',
				timestamp: '2024-10-08T15:15:00Z',
				metadata: {
					badge_name: 'Teamwork Participation',
					issuer: 'Corporate Training Center',
				},
			},
			{
				id: 'act_008',
				type: 'badge_issued',
				title: 'Earned Problem Solving Badge',
				description: 'Successfully completed problem-solving challenges',
				timestamp: '2024-10-05T10:45:00Z',
				metadata: {
					badge_name: 'Problem Solving',
					issuer: 'Skills Academy',
				},
			},
			{
				id: 'act_009',
				type: 'collection_created',
				title: 'Created Technical Skills Collection',
				description: 'Organized technical competency badges',
				timestamp: '2024-10-01T14:00:00Z',
				metadata: {
					collection_name: 'Technical Skills',
				},
			},
			{
				id: 'act_010',
				type: 'badge_issued',
				title: 'Earned Innovation Workshop Badge',
				description: 'Participated in innovation and creativity workshop',
				timestamp: '2024-09-28T12:30:00Z',
				metadata: {
					badge_name: 'Innovation Workshop',
					issuer: 'Innovation Hub',
				},
			},
		],
	};

	constructor() {}

	// ==========================================
	// Mock Data Methods
	// ==========================================

	/**
	 * Get mock badge statistics
	 *
	 * Simulates API delay for realistic testing
	 *
	 * @returns Observable with mock badge statistics
	 */
	getBadgeStatistics(): Observable<ApiBadgeStatistics> {
		console.log('[MOCK] Returning mock badge statistics');
		return of(this.badgeStatisticsMock).pipe(delay(300));
	}

	/**
	 * Get mock activity feed
	 *
	 * Simulates API delay and supports pagination parameters
	 *
	 * @param limit - Maximum number of items to return
	 * @returns Observable with mock activity feed
	 */
	getActivityFeed(limit = 10): Observable<ApiActivityFeedResponse> {
		console.log(`[MOCK] Returning mock activity feed (limit: ${limit})`);

		// Slice results based on limit
		const results = this.activityFeedMock.results.slice(0, limit);

		const response: ApiActivityFeedResponse = {
			...this.activityFeedMock,
			results,
			count: this.activityFeedMock.results.length,
		};

		return of(response).pipe(delay(300));
	}

	/**
	 * Check if mock data is being used
	 *
	 * Useful for displaying debug information or warnings to users
	 *
	 * @returns True if mock service is active
	 */
	isMockDataActive(): boolean {
		return true;
	}

	/**
	 * Get mock data status message
	 *
	 * Provides information about which endpoints are using mock data
	 *
	 * @returns Status message
	 */
	getMockStatus(): string {
		return 'Using mock data for badge-statistics and activity endpoints. Backend implementation pending.';
	}
}
