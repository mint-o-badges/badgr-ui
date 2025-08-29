import { ApiEntityRef } from '../../common/model/entity-ref';
import { ApiIssuer } from './issuer-api.model';

export type NetworkSlug = string;
export type NetworkUrl = string;

export interface NetworkRef {
	'@id': NetworkUrl;
	slug: NetworkSlug;
}

export interface ApiNetworkJsonld {
	'@context': string;
	type: string;
	id: NetworkUrl;

	name: string;
	description: string;
	url: string;
	image: string;
}

export interface ApiNetwork {
	name: string;
	slug: NetworkSlug;
	description: string;
	image: string;
	country: string;
	state: string;

	created_at: string;
	created_by: string;
	staff: ApiNetworkStaff[];
	partner_issuers: ApiIssuer[];

	json: ApiNetworkJsonld;
}

export type NetworkStaffRoleSlug = 'owner' | 'editor' | 'staff';
export interface ApiNetworkStaff {
	role: NetworkStaffRoleSlug;
	user: {
		first_name: string;
		last_name: string;
		email?: string;
		telephone?: string | string[];
		url?: string | string[];
		agreed_terms_version: number;
		latest_terms_version: number;
	};
}

export interface NetworkStaffRef extends ApiEntityRef {}

export interface ApiNetworkStaffOperation {
	action: 'add' | 'modify' | 'remove';
	username?: string;
	email?: string;
	role?: NetworkStaffRoleSlug;
}

export interface ApiNetworkForCreation {
	name: string;
	description: string;
	image: string;
	url: string;
	country: string;
	state?: string;
}

export interface ApiNetworkForEditing {
	name: string;
	description: string;
	image: string;
	url: string;
	country: string;
	state?: string;
}

export interface NetworkStaffOperation {
	action: 'add' | 'modify' | 'remove';
	username?: string;
	email?: string;
	role?: NetworkStaffRoleSlug;
}
