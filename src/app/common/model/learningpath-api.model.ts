import { ApiEntityRef } from './entity-ref';
import { ApiUserProfile } from './user-profile-api.model';

export type LearningPathUrl = string;

export interface LearningPathRef extends ApiEntityRef {}

export interface ApiLearningPathForCreation {
	slug?: string;
	issuer_id: string;
	name: string;
	description: string;
	tags: string[];
	participationBadge_id: string;
	badges: Array<{ badge: any; order: number }>;
	required_badges_count: number;
	activated: boolean;
}

export interface ApiLearningPath extends Omit<ApiLearningPathForCreation, 'badges'> {
	id?: number;
	slug?: string;
	issuer_id: string;
	issuer_name: string;
	participationBadge_id: string;
	participationBadge_image?: string;
	name: string;
	description: string;
	tags: string[];
	badges: Array<{ badge: any; order: number }>;
	required_badges_count: number;
	completed_badges?: Array<any>;
	progress?: number | null;
	completed_at?: Date | null;
	created_at?: Date | null;
	requested?: boolean;
	issuerOwnerAcceptedTos?: boolean;
	activated: boolean;
}

export interface ApiLearningPathParticipant {
	id?: number;
	slug?: string;
	entity_id?: string;
	user: ApiUserProfile;
	completed_badges: number;
	started_at: Date;
	completed_at: Date | null;
}

export interface LearningPathRef extends ApiEntityRef {}
