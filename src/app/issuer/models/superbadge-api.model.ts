export interface SuperbadgeRef {
	"@id": string;
	slug: string
}

export interface ApiSuperBadge {
	name: string;
	description: string;
	badges: ApiSuperBadgeEntry[];
	image: string;
	// issuerUrl: string;
    // issuerName: string;
    slug: string;
    created_at?: string;
	created_by?: string;
}


export interface SuperBadgeEntryRef {
	"@id": string;
	slug: string;
}

export interface ApiSuperBadgeEntry {
	id: string;
	description: string;
}
