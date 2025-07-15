export interface IBadgeClassV3Criterion {
	name: string;
	description: string;
}

export interface CompetencyExtension {
	name: string;
	description: string;
	framework_identifier: string;
	studyLoad: number;
	hours: number;
	minutes: number;
	category: string;
	source: string;
	framework: string;
}

export interface StudyLoadExtension {
	StudyLoad: number;
}

export interface CategoryExtension {
	Category: string;
}

export interface LevelExtension {
	Level: string;
}

export interface BasedOnExtension {
	BasedOn: {
		slug: string;
		issuerSlug: string;
	};
}

export interface LicenseExtension {
	id: string;
	name: string;
	legalCode: string;
}

export interface OrgImageExtension {
	OrgImage: string;
}

export interface IBadgeClassV3Extensions {
	'extensions:StudyLoadExtension'?: StudyLoadExtension;
	'extensions:CategoryExtension'?: CategoryExtension;
	'extensions:LevelExtension'?: LevelExtension;
	'extensions:BasedOnExtension'?: BasedOnExtension;
	'extensions:LicenseExtension'?: LicenseExtension;
	'extensions:CompetencyExtension'?: CompetencyExtension[];
	'extensions:OrgImageExtension'?: OrgImageExtension;
}

export interface IBadgeClassV3 {
	/** A string representing a Date object at which the BadgeClass was created */
	created_at: string;

	/** A string representing a Date object at which the BadgeClass was update */
	updated_at: string;

	/** The user that has created this BadgeClass */
	created_by: string;

	name: string;
	image: string;
	imageFrame: boolean;
	slug: string;
	criteria: IBadgeClassV3Criterion[];
	recipient_count: number;
	description: string;
	tags: string[];
	extensions: IBadgeClassV3Extensions;
	issuerVerified: boolean;
	copy_permissions: 'issuer' | 'others'[];
	issuerName: string;
	issuerOwnerAcceptedTos: boolean;

	/** URL pointing to the issuer */
	issuer: string;
	json: { id: string };
}

export class BadgeClassV3 implements IBadgeClassV3 {
	created_at: string;
	updated_at: string;
	created_by: string;
	id: number;
	name: string;
	image: string;
	imageFrame: boolean;
	slug: string;
	criteria: IBadgeClassV3Criterion[];
	recipient_count: number;
	description: string;
	tags: string[];
	extensions: IBadgeClassV3Extensions;
	issuerVerified: boolean;
	copy_permissions: 'issuer' | 'others'[];
	issuerName: string;
	issuerOwnerAcceptedTos: boolean;
	issuer: string;
	json: { id: string };

	constructor(data: IBadgeClassV3) {
		Object.assign(this, data);
	}

	get createdAt(): Date {
		return new Date(this.created_at);
	}

	get issuerSlug(): string {
		return (this.issuer.match(/\/public\/issuers\/([^\/]+)/) || [])[1] || null;
	}

	get url(): string {
		return this.json.id;
	}
}
