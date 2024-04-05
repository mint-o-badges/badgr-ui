export interface AiSkillsResult {
	id: string;
	text_to_analyze: string;
	language: string;
	skills: Skill[];
	status: string;
}

export interface Skill {
	preferred_label: string;
	alt_labels: string[];
	description: string;
	concept_uri: string;
}
