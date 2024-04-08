/**
 * The shape of a Badgr Config object. As there may be multiple config sources, each one may not specify all parts.
 */
import { BadgrTheme } from '../theming/badgr-theme';
import { ExternalAuthProvider } from '../app/common/model/user-profile-api.model';

export interface BadgrConfig {
	api: ApiConfig;
	help: HelpConfig;
	features: FeaturesConfig;
	assertionVerifyUrl: string;
	theme: BadgrTheme;
}

/**
 * API Configuration, indicating where and how Badgr UI should communicate with the server.
 */
export interface ApiConfig {
	/**
	 * The base URL of the Badgr Server to communicate with. All API calls will be relative to this, e.g. 'http://localhost:8000'
	 */
	baseUrl: string;

	/**
	 *
	 */
	integrationEndpoints?: string[];

	/**
	 * Configures an optional delay for all API calls. Allows the simulation of a slow server or network for testing of
	 * progress indication and other API-speed dependent features.
	 */
	debugDelayRange?: {
		/**
		 * Minimum number of milliseconds all API calls should be delayed by.
		 */
		minMs: number;
		/**
		 * Maximum number of milliseconds all API calls should be delayed by.
		 */
		maxMs: number;
	};
}

/**
 * Support configuration, used for help links, contact information, etc...
 */
export interface HelpConfig {
	email: string;
	alternateLandingUrl?: string;
}

/**
 * Feature configuration for experimental or other optional features
 */
export interface FeaturesConfig {
	/**
	 * Enables the initial landing page redirect
	 */
	alternateLandingRedirect?: boolean;

	/**
	 * Allows configuration of a specific set of social providers smaller than the default. If omitted, all providers
	 * will be enabled.
	 */
	socialAccountProviders?: string[];
	externalAuthProviders?: ExternalAuthProvider[];
	disableRegistration?: boolean;
	disableIssuers?: boolean;
	enableComingFromMozilla?: boolean;
}
