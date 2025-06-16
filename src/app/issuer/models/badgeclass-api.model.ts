import { IssuerUrl } from './issuer-api.model';
import { ApiEntityRef } from '../../common/model/entity-ref';

export type BadgeClassSlug = string;
export type BadgeClassUrl = string;
export type BadgeClassSqlId = number;
export interface BadgeClassRef extends ApiEntityRef {}

export type BadgeClassExpiresDuration = 'days' | 'weeks' | 'months' | 'years';

export type BadgeClassLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
export type BadgeClassCategory = 'competency' | 'participation' | 'learningpath';
export type BadgeClassCopyPermissions = 'issuer' | 'others';

export interface ApiBadgeClassJsonld {
	'@context': string;
	type: string;
	id: BadgeClassUrl;

	name: string;
	image: string;
	description: string;
	criteriaUrl: string;
	criteria_text: string;
	issuer: string;
}

export interface ApiBadgeClassForCreation {
	name: string;
	image: string;
	imageFrame?: boolean;
	description: string;
	criteria_url?: string;
	criteria_text?: string;

	extensions?: object;

	tags?: string[];
	alignment?: ApiBadgeClassAlignment[];
	expires?: ApiBadgeClassExpiration;
	copy_permissions?: BadgeClassCopyPermissions[];
	criteria?: Array<{ name: string; description: string }>;
}

export interface ApiBadgeClassAlignment {
	target_name: string;
	target_url: string;
	target_description?: string;
	target_framework?: string;
	target_code?: string;
}

export interface ApiBadgeClassExpiration {
	amount: number;
	duration: BadgeClassExpiresDuration;
}

export interface ApiBadgeClass extends ApiBadgeClassForCreation {
	id: BadgeClassSqlId;
	issuer: IssuerUrl;
	issuerName: string;

	slug: BadgeClassSlug;

	recipient_count: number;

	created_at: string;
	created_by: string;

	updated_at?: string;

	json: ApiBadgeClassJsonld;
	source_url: string;

	issuerVerified: boolean;
	issuerOwnerAcceptedTos: boolean;
}
