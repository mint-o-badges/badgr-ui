import { ApiEntityRef } from '../../common/model/entity-ref';
// import {BadgeClassUrl} from './badgeclass-api.model';
import { IssuerUrl } from './issuer-api.model';

export type CollectionBadgeInstanceSlug = string;
export type CollectionBadgeInstanceUrl = string;
export interface CollectionBadgeInstanceRef extends ApiEntityRef {}

export interface ApiCollectionBadgeInstanceForBatchCreation {
	issuer: IssuerUrl;
	collectionbadge_class: string;
	create_notification?: boolean;
	assertions: CollectionBadgeInstanceBatchAssertion[];
}

export interface ApiCollectionBadgeInstanceForCreation {
	issuer: IssuerUrl;
	collectionbadge_class: string;
	recipient_type: RecipientIdentifierType;
	recipient_identifier: string;
	create_notification?: boolean;
}

export type RecipientIdentifierType = 'email' | 'openBadgeId' | 'telephone' | 'url';

export interface ApiCollectionBadgeInstance {
	slug: CollectionBadgeInstanceSlug;
	image: string;
	recipient_identifier: string;
	recipient_type?: string;
	revoked: boolean;
	revocation_reason?: string;

	issuer: IssuerUrl;
	collectionbadge_class: string;

	created_at: string;
	created_by: string;

	public_url?: string;
}

export interface CollectionBadgeInstanceBatchAssertion {
	recipient_identifier: string;
}
