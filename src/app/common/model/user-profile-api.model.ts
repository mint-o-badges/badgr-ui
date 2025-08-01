import { ApiEntityRef } from './entity-ref';

/**
 * Personal information about the current user from the API
 */
export interface ApiUserProfile {
	first_name: string;
	last_name: string;
	agreed_terms_version: number;
	latest_terms_version: number;
	has_password_set: boolean;
	latest_terms_description: string;
	marketing_opt_in: boolean;
	secure_password_set: boolean;
}
export interface UserProfileRef extends ApiEntityRef {}

/**
 * Information about an email address associated with the current user profile from the API.
 */
export interface ApiUserProfileEmail {
	id: number;
	email: string;
	primary: boolean;
	verified: boolean;
}
export interface UserProfileEmailRef extends ApiEntityRef {}

/**
 * Information about the link between a Badgr user and an external social account.
 * From https://docs.google.com/document/d/1LfWvGPs8qSo46XSuI3UWITw8Tm8Ck16-xKw8C6aCavQ/edit#
 */
export interface ApiUserProfileSocialAccount {
	id: string;
	provider: SocialAccountProviderSlug;

	/**
	 * ISO 8601 datetime when account was linked to provider
	 */
	dateAdded: string;

	/**
	 * User id from provider (probably not human readable)
	 */
	uid: string;

	/**
	 * First name from provider (at time of first login)
	 */
	firstName: string;

	/**
	 * Last name from provider (at time of first login)
	 */
	lastName: string;

	/**
	 * Primary email provided by provider (at time of first login)
	 */
	primaryEmail: string;

	/**
	 * URL associated with user (if applicable)
	 */
	url: string;
}
export interface UserProfileSocialAccountRef extends ApiEntityRef {}

// TODO: now oAuth providers have been redefined as ExternalAuthProviders, determine if this code is in use for social sharing and prune if appropriate.
/**
 * Metadata about a social account provider
 */
export interface SocialAccountProviderInfo {
	slug: SocialAccountProviderSlug;
	name: string;
}

export type SocialAccountProviderSlug =
	| 'facebook'
	| 'kony'
	| 'linkedin_oauth2'
	| 'google'
	| 'azure'
	| 'twitter'
	| 'auth0';

export const socialAccountProviderInfos: SocialAccountProviderInfo[] = [
	{
		slug: 'facebook',
		name: 'Facebook',
	},
	{
		slug: 'kony',
		name: 'Kony',
	},
	{
		slug: 'linkedin_oauth2',
		name: 'LinkedIn',
	},
	{
		slug: 'google',
		name: 'Google',
	},
	{
		slug: 'azure',
		name: 'Microsoft',
	},
	{
		slug: 'twitter',
		name: 'Twitter',
	},
	{
		slug: 'auth0',
		name: 'Auth0',
	},
];

export function socialAccountProviderInfoForSlug(slug: string) {
	return socialAccountProviderInfos.find((i) => i.slug === slug);
}

export interface ExternalAuthProvider {
	slug: string;
	label: string;
	imgSrc: string;
	color: string;
}
