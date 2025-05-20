export interface CmsApiMenuItem {
	id: number;
	title: string;
}
export interface CmsApiMenu {
	header: {
		"de": CmsApiMenuItem[],
		"en": CmsApiMenuItem[],
	},
	footer: {
		"de": CmsApiMenuItem[],
		"en": CmsApiMenuItem[],
	}
}

export interface CmsApiPage {
	ID: number,
	post_content: string,
	post_title: string,
	slug: string,
}
export interface CmsApiPost {
	ID: number,
	post_author: string,
	post_excerpt: string,
	post_content: string,
	post_title: string,
	slug: string,
	post_thumbnail: string | null,
	post_tags: string[] | null,
}
