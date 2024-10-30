/**
 * TypeScript type information for a portion of the Open Badges v2.0 Specification, from
 * https://www.imsglobal.org/sites/default/files/Badges/OBv2p0/index.html
 */
import { BadgeClass } from '../../issuer/models/badgeclass.model';
import { Issuer } from '../../issuer/models/issuer.model';

export interface PublicApiBadgeAssertion {
	'@context': 'https://w3id.org/openbadges/v2';
	type: 'Assertion';
	image: string;
	badge: string | PublicApiBadgeClass;
	id: string;
	verification: {
		type: 'HostedBadge';
	};
	evidence:
		| Array<{
				type: 'Evidence';
				id?: string;
				narrative?: string;
		  }>
		| {
				narrative?: string;
		  }
		| string;
	narrative: string;
	issuedOn: string;
	expires?: string;
	revoked?: boolean;
	revocationReason?: string;
	recipient: {
		salt: string;
		type: 'email' | 'url' | 'telephone' | 'id';
		hashed: boolean;
		identity: string;
	};
	// Extension to the spec containing the original URL of this assertion if it is not stored by Badgr
	sourceUrl?: string;
}

export interface PublicApiBadgeAssertionWithBadgeClass extends PublicApiBadgeAssertion {
	badge: PublicApiBadgeClassWithIssuer;
}

export interface PublicApiBadgeClass {
	'@context': 'https://w3id.org/openbadges/v2';
	description: string;
	type: 'BadgeClass';
	id: string;
	hostedUrl: string;
	name: string;
	slug: string;
	issuer: string | PublicApiIssuer;
	image: string;
	criteria:
		| {
				id: string;
				narrative: string;
				criteriaUrl: string;
		  }
		| string;
	alignment: Array<{
		frameworkName?: string;
		targetName: string;
		targetUrl: string;
		targetDescription?: string;
		targetFramework?: string;
		targetCode?: string;
	}>;
	tags: string[];
	// Extension to the spec containing the original URL of this assertion if it is not stored by Badgr
	sourceUrl?: string;
	badge?: any;
}
export interface PublicApiBadgeClassWithIssuer extends PublicApiBadgeClass {
	issuer: PublicApiIssuer;
	badgeClass: BadgeClass;
	issueDate: string;
	mostRelevantStatus: string;
}

export interface PublicApiIssuer {
	'@context': 'https://w3id.org/openbadges/v2';
	description: string;
	url: string;
	email: string;
	type: 'Issuer';
	id: string;
	name: string;
	image?: string;
	// Extension to the spec containing the original URL of this assertion if it is not stored by Badgr
	sourceUrl?: string;
	hostedUrl?: string;
}

export interface PublicApiBadgeCollectionWithBadgeClassAndIssuer {
	entityId: string;
	entityType: 'SharedCollection';
	id: string;
	name: string;
	description: string;
	badges: PublicApiBadgeCollectionEntryWithBadgeClassAndIssuer[];

	owner: {
		firstName: string;
		lastName: string;
	};
}

export interface PublicApiBadgeCollectionEntryWithBadgeClassAndIssuer {
	'@context': 'https://w3id.org/openbadges/v2';
	type: 'Assertion';
	id: string;
	image: string;
	badge: PublicApiBadgeClassWithIssuer;

	uid: string;
	verify: {
		url: string;
		type: string;
	};

	issuedOn: string;

	recipient: {
		salt: string;
		type: string;
		hashed: boolean;
		identity: string;
	};

	sourceUrl?: string;
	hostedUrl?: string;
	expires?: string;
}

export interface PublicApiLearningPath {
	name: string;
	description: string;
	image?: string;
	badges: PublicApiBadgeClass[];
	slug: string;
	tags: string[];
	issuer_id: string;
	participationBadge_id: string;
	completed_badges?: any[];
	progress: number;
	requested?: boolean;
}
