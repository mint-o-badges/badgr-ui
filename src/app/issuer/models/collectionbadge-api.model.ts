export interface CollectionbadgeRef {
	"@id": string;
	slug: string
}

export interface ApiCollectionBadge {
	name: string;
	description: string;
	badges: any []
	image: string;
	// issuerUrl: string;
    // issuerName: string;
    slug: string;
    created_at?: string;
	created_by?: string;
}


export interface CollectionBadgeEntryRef {
	"@id": string;
	slug: string;
}

export interface ApiCollectionBadgeEntry {
	id: string;
	// description: string;
}
