/**
 * Dashboard Service Layer Interface Definitions
 *
 * This file defines the TypeScript interfaces for the dashboard service architecture.
 * It includes interfaces for all three service layers:
 * - DashboardApiService (Real API endpoints)
 * - DashboardAggregationService (Client-side aggregation)
 * - DashboardDataService (Facade layer)
 */

import { Observable } from 'rxjs';
import {
	KPIData,
	ChartData,
	BadgeType,
	BadgeTypeStats,
	BadgeAwardData,
	CompetencyBubbleData,
	ActivityItem,
	BadgeCompetencyData,
} from '../models/dashboard-models';

// ==========================================
// API Response Models (from badgr-server)
// ==========================================

/**
 * Badge class from badgr-server API
 * Based on Open Badges 2.0 specification
 */
export interface ApiBadgeClass {
	id: string;
	slug: string;
	name: string;
	description: string;
	image: string;
	criteria_text?: string;
	criteria_url?: string;
	alignments?: BadgeAlignment[];
	extensions?: BadgeExtensions;
	issuer: {
		slug: string;
		name: string;
		description?: string;
		url?: string;
		email?: string;
	};
	tags?: string[];
}

/**
 * Badge alignment (competency/skill framework)
 */
export interface BadgeAlignment {
	targetName: string;
	targetUrl: string;
	targetDescription?: string;
	targetFramework?: string; // e.g., "ESCO", "EQF"
	targetCode?: string;
}

/**
 * Badge extensions (custom metadata)
 */
export interface BadgeExtensions {
	'extensions:BadgeExtension'?: {
		badgeType?: BadgeType;
		category?: string;
		level?: string;
	};
	'extensions:CompetencyExtension'?: {
		competencies?: string[];
		escoSkills?: string[];
	};
	'extensions:LearningPathExtension'?: {
		courseId?: string;
		duration?: number;
		credits?: number;
	};
	[key: string]: any;
}

/**
 * Recipient badge instance (awarded badge)
 */
export interface ApiRecipientBadgeInstance {
	id: string;
	recipient_identifier: string;
	acceptance: string;
	narrative?: string;
	evidence_items?: any[];
	pending: boolean;
	extensions?: any[];
	json: {
		id: string;
		type: 'Assertion';
		uid: string;
		recipient: {
			type: string;
			recipient: string;
		};
		badge: ApiBadgeClass;
		issuedOn: string; // ISO 8601 date string
		image: string;
	};
	image: string;
	imagePreview?: {
		type: string;
		id: string;
	};
}

/**
 * User profile from badgr-server
 */
export interface ApiUserProfile {
	slug: string;
	firstName: string;
	lastName: string;
	emails: Array<{
		email: string;
		verified: boolean;
		primary: boolean;
	}>;
	url?: string;
	telephone?: string;
	agreedTermsVersion?: number;
	marketingOptIn?: boolean;
}

/**
 * ESCO skill from earner skills endpoint
 */
export interface ApiRootSkill {
	preferredLabel: string;
	conceptUri: string;
	proficiencyLevel?: number;
	description?: string;
	skillType?: string;
}

/**
 * Badge collection
 */
export interface ApiCollection {
	slug: string;
	name: string;
	description: string;
	badges: string[]; // Badge entity IDs
	published: boolean;
	share_url?: string;
}

// ==========================================
// Aggregated Data Models
// ==========================================

/**
 * Time-series data point
 */
export interface TimeSeriesData {
	date: Date;
	value: number;
	label: string;
}

/**
 * Competency statistics
 */
export interface CompetencyStats {
	name: string;
	escoUri: string;
	count: number;
	percentage: number;
	averageProficiency?: number;
	badges: string[]; // Badge IDs with this competency
}

/**
 * Institution/Issuer statistics
 */
export interface IssuerStats {
	slug: string;
	name: string;
	badgeCount: number;
	assertionCount: number;
	region?: string;
	activeSince?: Date;
	lastAwardDate?: Date;
	badgeTypes: {
		competency: number;
		participation: number;
		learningpath: number;
	};
}

/**
 * Growth metrics
 */
export interface GrowthMetrics {
	monthlyGrowthRate: number;
	yearlyGrowthRate: number;
	trend: 'up' | 'down' | 'stable';
	currentMonthCount: number;
	previousMonthCount: number;
	currentYearCount: number;
	previousYearCount: number;
}

/**
 * Dashboard KPIs
 */
export interface DashboardKPIs {
	totalBadges: number;
	totalInstitutions: number;
	totalCompetencies: number;
	averageBadgesPerUser?: number;
	growthMetrics: GrowthMetrics;
}

/**
 * Spatial distribution data
 */
export interface SpatialData {
	locationCode: string; // PLZ or canton code
	locationName: string;
	badgeCount: number;
	institutionCount: number;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
}

/**
 * Badge analytics summary
 */
export interface BadgeAnalytics {
	total: number;
	byType: BadgeTypeStats[];
	timeSeries: BadgeAwardData[];
	topIssuers: IssuerStats[];
	topBadges: BadgeCompetencyData[];
}

/**
 * Competency tracking summary
 */
export interface CompetencyTracking {
	distribution: CompetencyBubbleData[];
	topCompetencies: CompetencyStats[];
	totalUniqueSkills: number;
	mostCommonFramework?: string;
}

/**
 * Complete dashboard overview
 */
export interface DashboardOverview {
	kpis: KPIData[];
	badgeStatistics: BadgeAnalytics;
	competencyData: CompetencyTracking;
	activityFeed: ActivityItem[];
	lastUpdated: Date;
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
	startDate?: Date;
	endDate?: Date;
	badgeType?: BadgeType | 'all';
	issuerSlug?: string;
	region?: string;
	competency?: string;
}

/**
 * Filtered badge data
 */
export interface FilteredBadgeData {
	badges: ApiBadgeClass[];
	statistics: BadgeAnalytics;
	filters: DashboardFilters;
	totalCount: number;
}

/**
 * Time range data
 */
export interface TimeRangeData {
	startDate: Date;
	endDate: Date;
	badgeCount: number;
	timeSeries: BadgeAwardData[];
	growthMetrics: GrowthMetrics;
}

// ==========================================
// Service Layer Interfaces
// ==========================================

/**
 * DashboardApiService Interface
 *
 * Direct interface to badgr-server API endpoints.
 * All methods return Promises that resolve to API response data.
 */
export interface IDashboardApiService {
	// Badge endpoints
	getAllUserBadges(): Promise<ApiBadgeClass[]>;
	getAllPublicBadges(): Promise<ApiBadgeClass[]>;
	getBadgesForIssuer(issuerSlug: string): Promise<ApiBadgeClass[]>;
	getUserBadgeInstances(): Promise<ApiRecipientBadgeInstance[]>;
	getBadgeById(badgeId: string): Promise<ApiBadgeClass>;

	// User endpoints
	getUserProfile(): Promise<ApiUserProfile>;

	// Skills/Competencies endpoints
	getUserSkills(language?: string): Promise<ApiRootSkill[]>;

	// Collections endpoints
	getBadgeCollections(): Promise<ApiCollection[]>;

	// Assertions endpoints (via issuer API)
	// Note: May need issuer slug, consider iterating through user's issuers
	getIssuerAssertions(issuerSlug: string): Promise<ApiRecipientBadgeInstance[]>;
}

/**
 * DashboardAggregationService Interface
 *
 * Client-side data aggregation and statistics calculation.
 * All methods return Observables for reactive data flow.
 */
export interface IDashboardAggregationService {
	// Badge statistics
	getBadgeTypeDistribution(badges: ApiBadgeClass[]): Observable<BadgeTypeStats[]>;
	getBadgeCountByType(badges: ApiBadgeClass[]): Observable<{ [type: string]: number }>;
	getTotalBadgeCount(badges: ApiBadgeClass[]): Observable<number>;

	// Time-series analysis
	getBadgeAwardTimeSeries(
		badgeInstances: ApiRecipientBadgeInstance[],
		startDate?: Date,
		endDate?: Date,
	): Observable<BadgeAwardData[]>;
	getMonthlyBadgeGrowth(badgeInstances: ApiRecipientBadgeInstance[]): Observable<TimeSeriesData[]>;
	getYearlyBadgeTrends(badgeInstances: ApiRecipientBadgeInstance[]): Observable<TimeSeriesData[]>;

	// Competency statistics
	getCompetencyDistribution(skills: ApiRootSkill[], badges: ApiBadgeClass[]): Observable<CompetencyBubbleData[]>;
	getTopCompetencies(skills: ApiRootSkill[], limit: number): Observable<CompetencyStats[]>;

	// Institution statistics
	getInstitutionStatistics(badges: ApiBadgeClass[]): Observable<IssuerStats[]>;
	getTopIssuers(badges: ApiBadgeClass[], limit: number): Observable<IssuerStats[]>;

	// KPI calculations
	calculateTotalKPIs(
		badges: ApiBadgeClass[],
		badgeInstances: ApiRecipientBadgeInstance[],
		skills: ApiRootSkill[],
	): Observable<DashboardKPIs>;
	calculateGrowthMetrics(badgeInstances: ApiRecipientBadgeInstance[]): Observable<GrowthMetrics>;

	// Activity feed
	generateActivityFeed(
		badges: ApiBadgeClass[],
		badgeInstances: ApiRecipientBadgeInstance[],
		limit: number,
	): Observable<ActivityItem[]>;

	// Utility methods
	classifyBadgeType(badge: ApiBadgeClass): BadgeType;
	extractCompetencies(badge: ApiBadgeClass): string[];
}

/**
 * DashboardDataService Interface (Facade)
 *
 * Unified interface combining real API data + aggregated statistics.
 * This is the primary service that components should use.
 */
export interface IDashboardDataService {
	// High-level dashboard data
	getDashboardOverview(filters?: DashboardFilters): Observable<DashboardOverview>;
	getKPIData(filters?: DashboardFilters): Observable<KPIData[]>;
	getBadgeAnalytics(filters?: DashboardFilters): Observable<BadgeAnalytics>;
	getCompetencyTracking(filters?: DashboardFilters): Observable<CompetencyTracking>;

	// Filtered data
	getBadgeDataFiltered(filters: DashboardFilters): Observable<FilteredBadgeData>;
	getTimeRangeData(startDate: Date, endDate: Date): Observable<TimeRangeData>;

	// Specific data queries
	getBadgeTypeDistribution(): Observable<BadgeTypeStats[]>;
	getTopIssuers(limit?: number): Observable<IssuerStats[]>;
	getTopCompetencies(limit?: number): Observable<CompetencyStats[]>;
	getSpatialDistribution(granularity?: 'plz' | 'canton' | 'region'): Observable<SpatialData[]>;

	// Real-time updates
	subscribeToActivityFeed(limit?: number): Observable<ActivityItem[]>;

	// Cache management
	clearCache(): void;
	refreshData(): Observable<void>;
	isCacheValid(key: string): boolean;

	// Data export
	exportDashboardData(format: 'json' | 'csv'): Observable<Blob>;
}

// ==========================================
// Error Handling Models
// ==========================================

/**
 * Dashboard error types
 */
export enum DashboardErrorType {
	API_UNAVAILABLE = 'API_UNAVAILABLE',
	AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
	AGGREGATION_FAILED = 'AGGREGATION_FAILED',
	INVALID_DATA = 'INVALID_DATA',
	NETWORK_ERROR = 'NETWORK_ERROR',
	CACHE_ERROR = 'CACHE_ERROR',
}

/**
 * Dashboard error model
 */
export interface DashboardError {
	type: DashboardErrorType;
	message: string;
	originalError?: Error;
	retryable: boolean;
	fallbackAvailable: boolean;
	timestamp: Date;
	context?: string;
}

// ==========================================
// Cache Configuration Models
// ==========================================

/**
 * Cache configuration
 */
export interface CacheConfig {
	key: string;
	ttl: number; // Time to live in milliseconds
	invalidateOn?: string[]; // Events that invalidate this cache
	shareReplay?: boolean; // Use RxJS shareReplay
	maxSize?: number; // Maximum cache size in entries
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
	data: T;
	timestamp: Date;
	expiresAt: Date;
	hitCount: number;
}

// ==========================================
// Mock Data Service Interface
// ==========================================

/**
 * Mock data service for unavailable endpoints
 */
export interface IMockDataService {
	generateMockSpatialData(granularity: 'plz' | 'canton'): SpatialData[];
	generateMockGenderDistribution(): ChartData;
	generateMockActivityFeed(limit: number): ActivityItem[];
}

// ==========================================
// Utility Types
// ==========================================

/**
 * API request options
 */
export interface ApiRequestOptions {
	includeAuthentication?: boolean;
	timeout?: number;
	retryCount?: number;
	cacheKey?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
	data: T[];
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
