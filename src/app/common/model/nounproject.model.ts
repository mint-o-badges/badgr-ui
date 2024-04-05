export interface NounProjectIcon {
	attribution: string;
	collections: string[];
	date_uploaded: string;
	icon_url: string;
	id: string;
	is_active: string;
	is_explicit: string;
	license_description: string;
	nounji_free: string;
	permalink: string;
	thumbnail_url: string;
	sponsor: string;
	sponsor_campaign_link: string | null;
	sponsor_id: string;
	tags: NounProjectIconTag[];
	term: string;
	term_id: number;
	term_slug: string;
	updated_at: string;
	uploader: NounProjectIconUploader;
	uploader_id: string;
	year: number;
	tag_slugs?: string;
}

export interface NounProjectIconUploader {
	loaction: string;
	name: string;
	permalink: string;
	username: string;
}

export interface NounProjectIconTag {
	id: string;
	slug: string;
}
