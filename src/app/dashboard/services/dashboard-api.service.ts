import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import { DashboardMockService } from './dashboard-mock.service';
import { firstValueFrom } from 'rxjs';
import {
	ApiUserProfile,
	ApiBadgeStatistics,
	ApiBadgeAwardsParams,
	ApiBadgeAwardsResponse,
	ApiSkillsDistribution,
	ApiCollectionsResponse,
	ApiInstitutionStatistics,
	ApiRegionalDataResponse,
	ApiActivityFeedResponse,
} from '../models/dashboard-api.model';

/**
 * Dashboard API Service
 *
 * Provides access to dashboard-specific endpoints on the badgr-server API.
 * Extends BaseHttpApiService to inherit authentication, error handling,
 * and HTTP utilities.
 *
 * **Mock Fallback Support:**
 * When backend endpoints are not yet implemented (404 errors), this service
 * automatically falls back to mock data provided by DashboardMockService.
 * This ensures the UI remains functional during backend development.
 *
 * Usage:
 * - Inject this service into dashboard components
 * - Call methods to fetch aggregated data for visualizations
 * - All methods return Promises that resolve to typed API responses
 * - Mock data is used transparently when APIs are unavailable
 */
@Injectable({ providedIn: 'root' })
export class DashboardApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		private mockService: DashboardMockService,
	) {
		super(loginService, http, configService, messageService);
	}

	// ==========================================
	// User Profile Methods
	// ==========================================

	/**
	 * Get the authenticated user's profile data
	 *
	 * @returns Promise resolving to user profile
	 */
	getUserProfile(): Promise<ApiUserProfile> {
		return this.get<ApiUserProfile>('/v1/user/profile').then((r) => r.body);
	}

	// ==========================================
	// Badge Statistics Methods
	// ==========================================

	/**
	 * Get aggregated badge statistics
	 *
	 * Fetches badge counts by type, year, and month from the API.
	 * This is the primary method for dashboard KPI displays.
	 *
	 * **Fallback:** Uses mock data if endpoint returns 404
	 *
	 * @returns Promise resolving to badge statistics
	 */
	getBadgeStatistics(): Promise<ApiBadgeStatistics> {
		return this.get<ApiBadgeStatistics>('/v1/earner/badge-statistics')
			.then((r) => r.body)
			.catch((error) => {
				// If endpoint not found (404), use mock data
				if (error.status === 404) {
					console.warn('[DashboardApiService] /v1/earner/badge-statistics not implemented, using mock data');
					return firstValueFrom(this.mockService.getBadgeStatistics());
				}
				throw error;
			});
	}

	// ==========================================
	// Badge Awards Methods
	// ==========================================

	/**
	 * Get badge awards with optional filtering
	 *
	 * Supports pagination and filtering by year, month, and badge type.
	 * Use this for time-series visualizations and detailed award lists.
	 *
	 * @param params - Filter and pagination parameters
	 * @returns Promise resolving to paginated badge awards
	 *
	 * @example
	 * ```typescript
	 * // Get all awards from 2024
	 * const awards = await service.getBadgeAwards({ year: 2024 });
	 *
	 * // Get competency badges from January 2024
	 * const competencyAwards = await service.getBadgeAwards({
	 *   year: 2024,
	 *   month: 1,
	 *   type: 'competency'
	 * });
	 * ```
	 */
	getBadgeAwards(params?: ApiBadgeAwardsParams): Promise<ApiBadgeAwardsResponse> {
		let httpParams = new HttpParams().set('json_format', 'plain');

		if (params) {
			if (params.year) {
				httpParams = httpParams.set('year', params.year.toString());
			}
			if (params.month) {
				httpParams = httpParams.set('month', params.month.toString());
			}
			if (params.type && params.type !== 'all') {
				httpParams = httpParams.set('type', params.type);
			}
			if (params.limit) {
				httpParams = httpParams.set('limit', params.limit.toString());
			}
			if (params.offset) {
				httpParams = httpParams.set('offset', params.offset.toString());
			}
		}

		return this.get<ApiBadgeAwardsResponse>('/v1/earner/badges', httpParams).then((r) => r.body);
	}

	// ==========================================
	// Skills Distribution Methods
	// ==========================================

	/**
	 * Get skills/competencies distribution across badges
	 *
	 * Fetches aggregated skill data from badge alignments and tags.
	 * Use this for competency bubble charts and skill analytics.
	 *
	 * @param language - Language code for localized skill names (default: 'de')
	 * @returns Promise resolving to skills distribution data
	 */
	getSkillsDistribution(language = 'de'): Promise<ApiSkillsDistribution> {
		const params = new HttpParams().set('lang', language);
		return this.get<ApiSkillsDistribution>('/v1/earner/skills', params).then((r) => r.body);
	}

	// ==========================================
	// Collections Methods
	// ==========================================

	/**
	 * Get all badge collections for the authenticated user
	 *
	 * @returns Promise resolving to collections response
	 */
	getCollections(): Promise<ApiCollectionsResponse> {
		return this.get<ApiCollectionsResponse>('/v1/earner/collections').then((r) => r.body);
	}

	/**
	 * Get a specific collection by ID
	 *
	 * @param collectionId - Collection identifier
	 * @returns Promise resolving to collection data
	 */
	getCollection(collectionId: string | number): Promise<any> {
		return this.get(`/v1/earner/collections/${collectionId}`).then((r) => r.body);
	}

	// ==========================================
	// Institution/Issuer Statistics Methods
	// ==========================================

	/**
	 * Get institution statistics
	 *
	 * Fetches aggregated data about institutions/issuers.
	 * Note: This endpoint may require administrative privileges.
	 *
	 * @returns Promise resolving to institution statistics
	 */
	getInstitutionStatistics(): Promise<ApiInstitutionStatistics> {
		return this.get<ApiInstitutionStatistics>('/v1/issuer/statistics').then((r) => r.body);
	}

	// ==========================================
	// Regional Data Methods
	// ==========================================

	/**
	 * Get regional badge distribution data
	 *
	 * Fetches badge counts and statistics grouped by region.
	 * Use this for geographic visualizations and regional analytics.
	 *
	 * @param regionType - Type of region (e.g., 'plz', 'city')
	 * @returns Promise resolving to regional data
	 */
	getRegionalData(regionType = 'plz'): Promise<ApiRegionalDataResponse> {
		const params = new HttpParams().set('region_type', regionType);
		return this.get<ApiRegionalDataResponse>('/v1/earner/regional-data', params).then((r) => r.body);
	}

	// ==========================================
	// Activity Feed Methods
	// ==========================================

	/**
	 * Get recent activity feed
	 *
	 * Fetches recent badge awards, collection creations, and other activities.
	 * Useful for activity timelines and notification feeds.
	 *
	 * **Fallback:** Uses mock data if endpoint returns 404
	 *
	 * @param limit - Maximum number of items to return (default: 10)
	 * @returns Promise resolving to activity feed
	 */
	getActivityFeed(limit = 10): Promise<ApiActivityFeedResponse> {
		const params = new HttpParams().set('limit', limit.toString());
		return this.get<ApiActivityFeedResponse>('/v1/earner/activity', params)
			.then((r) => r.body)
			.catch((error) => {
				// If endpoint not found (404), use mock data
				if (error.status === 404) {
					console.warn('[DashboardApiService] /v1/earner/activity not implemented, using mock data');
					return firstValueFrom(this.mockService.getActivityFeed(limit));
				}
				throw error;
			});
	}

	// ==========================================
	// Issuer-Specific Methods
	// ==========================================

	/**
	 * Get badge classes for a specific issuer
	 *
	 * This is useful for issuer-specific dashboards showing their badge offerings.
	 *
	 * @param issuerSlug - Issuer identifier
	 * @returns Promise resolving to badge classes array
	 */
	getIssuerBadgeClasses(issuerSlug: string): Promise<any[]> {
		return this.get<any[]>(`/v1/issuer/issuers/${issuerSlug}/badgeclasses`).then((r) => r.body);
	}

	/**
	 * Get assertions (badge instances) for a specific issuer
	 *
	 * @param issuerSlug - Issuer identifier
	 * @returns Promise resolving to assertions array
	 */
	getIssuerAssertions(issuerSlug: string): Promise<any[]> {
		return this.get<any[]>(`/v1/issuer/issuers/${issuerSlug}/assertions`).then((r) => r.body);
	}
}
