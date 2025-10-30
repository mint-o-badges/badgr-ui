/**
 * Dashboard Data Models
 *
 * Shared TypeScript interfaces and types for the municipal dashboard.
 * These models define the structure for KPIs, charts, badges, and competency data.
 */

// ==========================================
// KPI Models
// ==========================================

/**
 * Key Performance Indicator data structure
 * Used for displaying metrics with trends and visual indicators
 */
export interface KPIData {
	/** Display label for the KPI */
	label: string;
	/** The current value (can be numeric or formatted string) */
	value: number | string;
	/** Optional unit of measurement (e.g., "Institutionen", "Badges") */
	unit?: string;
	/** Trend direction indicator */
	trend?: 'up' | 'down' | 'stable';
	/** Numeric value of the trend change */
	trendValue?: number;
	/** Human-readable trend description */
	trendLabel?: string;
	/** Icon identifier (e.g., "lucideBuilding") */
	icon?: string;
	/** CSS color class for styling */
	color?: string;
	/** Additional information displayed on hover */
	tooltip?: string;
}

// ==========================================
// Chart Models
// ==========================================

/**
 * Generic chart data structure
 * Used for various chart types (pie, bar, line)
 */
export interface ChartData {
	/** Array of labels for chart data points */
	labels: string[];
	/** Array of numeric values corresponding to labels */
	values: number[];
	/** Optional array of colors for each data point */
	backgroundColor?: string[];
}

// ==========================================
// Badge Models
// ==========================================

/**
 * Badge type enumeration for type safety
 */
export type BadgeType = 'participation' | 'competency' | 'learningpath';

/**
 * Statistics for different badge types
 * Used in pie charts and summary displays
 */
export interface BadgeTypeStats {
	/** Type of badge */
	type: BadgeType;
	/** Display label in German */
	label: string;
	/** Number of badges of this type */
	count: number;
	/** Percentage of total badges */
	percentage: number;
	/** Color for visual representation */
	color: string;
}

/**
 * Time-series data for badge awards
 * Used in line charts to show badge distribution over time
 */
export interface BadgeAwardData {
	/** Calendar year (e.g., 2024) */
	year: number;
	/** Month number (1-12) */
	month: number;
	/** Type of badge awarded */
	type: BadgeType;
	/** Number of badges awarded in this period */
	count: number;
	/** Date object for the award period */
	date: Date;
}

/**

// ==========================================
// Competency Models
// ==========================================

/**
 * Competency bubble chart data
 * Used for visualizing competency distribution with weighted sizes
 */
export interface CompetencyBubbleData {
	/** Name of the competency category */
	name: string;
	/** Percentage value */
	value: number;
	/** Weight for bubble size calculation */
	weight: number;
	/** Color for the bubble */
	color: string;
}

// ==========================================
// Helper Types
// ==========================================

/**
 * Filter options for year selection
 */
export interface YearFilterOption {
	/** Year value */
	value: number;
	/** Display label */
	label: string;
}

/**
 * Filter options for month selection
 */
export interface MonthFilterOption {
	/** Month number (1-12) */
	value: number;
	/** German month name */
	label: string;
}

/**
 * Filter options for badge type selection
 */
export interface BadgeTypeFilterOption {
	/** Badge type value or 'all' */
	value: string;
	/** Display label in German */
	label: string;
}

/**
 * Activity feed item
 */
export interface ActivityItem {
	/** Type of activity */
	type: 'badge' | 'esco' | 'course' | 'institution';
	/** Activity title/description */
	title: string;
	/** Number of items affected */
	count: number;
	/** Date of the activity */
	date: Date;
	/** Icon identifier */
	icon: string;
}

/**
 * Badge competency data for horizontal bar charts
 */
export interface BadgeCompetencyData {
	/** Badge title/name */
	badgeTitle: string;
	/** Number of badges */
	count: number;
	/** Color for the bar */
	color: string;
}
