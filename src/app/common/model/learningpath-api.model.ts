import { ApiEntityRef } from "./entity-ref";
import { ApiUserProfile } from "./user-profile-api.model";

export interface ApiLearningPath {
    id?: number;
    slug?: string;
    issuer_id: string;
    issuer_name: string;
    participationBadge_id: string;
    name: string;
    description: string;
    tags: string[];
    badges: Array<{ id: string; order: number }>;
}

export interface ApiLearningPathParticipant {
    id?: number; 
    slug?: string;
    user: ApiUserProfile;
    completed_badges: number;
    started_at: Date;
    completed_at: Date | null;
}



export interface LearningPathRef extends ApiEntityRef {}