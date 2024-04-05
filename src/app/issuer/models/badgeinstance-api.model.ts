import { ApiEntityRef } from '../../common/model/entity-ref';
import { BadgeClassUrl } from './badgeclass-api.model';
import { IssuerUrl } from './issuer-api.model';

export type BadgeInstanceSlug = string;
export type BadgeInstanceUrl = string;
export interface BadgeInstanceRef extends ApiEntityRef {}

export interface ApiBadgeInstanceJsonld {
	'@context': string;
	type: string;
	id: BadgeInstanceUrl;

	uid: string;
	evidence_items: ApiBadgeInstanceEvidenceItem[];
	issuedOn: string;
	image: string;
}

export interface ApiBadgeInstanceForBatchCreation {
	issuer: IssuerUrl;
	badge_class: BadgeClassUrl;
	create_notification?: boolean;
	assertions: BadgeInstanceBatchAssertion[];
	evidence_items?: ApiBadgeInstanceEvidenceItem[];
}

export interface ApiBadgeInstanceForCreation {
	issuer: IssuerUrl;
	badge_class: BadgeClassUrl;
	recipient_type: RecipientIdentifierType;
	recipient_identifier: string;
	narrative?: string;
	create_notification?: boolean;
	evidence_items?: ApiBadgeInstanceEvidenceItem[];
	extensions?: object;
	expires?: string;
}

export type RecipientIdentifierType = 'email' | 'openBadgeId' | 'telephone' | 'url';

export interface ApiBadgeInstanceEvidenceItem {
	evidence_url?: string;
	narrative?: string;
}

export interface ApiBadgeInstance {
	slug: BadgeInstanceSlug;
	image: string;
	recipient_identifier: string;
	recipient_type?: string;
	revoked: boolean;
	revocation_reason?: string;
	expires?: string;

	evidence_items?: ApiBadgeInstanceEvidenceItem[];

	issuer: IssuerUrl;
	badge_class: BadgeClassUrl;

	created_at: string;
	created_by: string;

	json: ApiBadgeInstanceJsonld;
	extensions?: object;

	public_url?: string;
}

export interface BadgeInstanceBatchAssertion {
	recipient_identifier: string;
	evidence_items?: ApiBadgeInstanceEvidenceItem[];
}
