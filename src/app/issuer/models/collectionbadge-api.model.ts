export interface CollectionbadgeRef {
	'@id': string;
	slug: string;
}

export interface ApiCollectionBadge {
	name: string;
	description: string;
	badges: ApiCollectionBadgeEntry[];
	image: string;
	slug: string;
	created_at?: string;
	created_by?: string;
}

export interface CollectionBadgeEntryRef {
	'@id': string;
	slug: string;
}

export interface ApiCollectionBadgeEntry {
	slug: string;
}
