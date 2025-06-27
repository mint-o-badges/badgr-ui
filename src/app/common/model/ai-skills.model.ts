export interface AiSkillsResult {
	id: string;
	text_to_analyze: string;
	language: string;
	skills: ApiSkill[];
	status: string;
}

export interface ApiSkill {
	preferred_label: string;
	alt_labels: string[];
	description: string;
	concept_uri: string;
	type: string;
	reuse_level: string;
	studyLoad?: number;
	breadcrumb_paths?: [ApiSkill[]];
}

export interface ApiRootSkill extends ApiSkill {
	studyLoad: number;
	breadcrumb_paths: [ApiSkill[]];
}
