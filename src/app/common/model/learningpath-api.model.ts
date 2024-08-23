import { ApiEntityRef } from "./entity-ref";

export interface ApiLearningPath {
    id?: number;
    slug?: string;
    issuer_id: string;
    name: string;
    description: string;
    tags: string[];
    badges: Array<{ id: string; order: number }>;
}

export interface LearningPathRef extends ApiEntityRef {}