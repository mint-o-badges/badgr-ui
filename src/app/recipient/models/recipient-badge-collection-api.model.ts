import { ApiRecipientBadgeInstanceSlug } from './recipient-badge-api.model';

export type RecipientBadgeCollectionUrl = string;
export type RecipientBadgeCollectionSlug = string;

export interface RecipientBadgeCollectionRef {
	'@id': RecipientBadgeCollectionUrl;
	slug: RecipientBadgeCollectionSlug;
}

export interface ApiRecipientBadgeCollectionForCreation {
	name: string;
	description: string;
	badges: ApiRecipientBadgeCollectionEntry[];
	published: boolean;
}

export interface ApiRecipientBadgeCollection extends ApiRecipientBadgeCollectionForCreation {
	readonly slug: string;
	readonly share_hash: string;
	readonly share_url: string;
}

export interface RecipientBadgeCollectionEntryRef {
	'@id': string;
	slug: string;
}

export interface ApiRecipientBadgeCollectionEntry {
	id: ApiRecipientBadgeInstanceSlug;
	description: string;
}
