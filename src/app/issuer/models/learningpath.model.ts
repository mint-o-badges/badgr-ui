import {
    ApiLearningPath,
    LearningPathRef
} from '../../common/model/learningpath-api.model';
import { ManagedEntity } from '../../common/model/managed-entity';
import { ApiEntityRef } from '../../common/model/entity-ref';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

export class LearningPath extends ManagedEntity<ApiLearningPath, LearningPathRef> {

	get name(): string {
		return this.apiModel.name;
	}
	set name(name: string) {
		this.apiModel.name = name;
	}

	get description(): string {
		return this.apiModel.description;
	}
	set description(description: string) {
		this.apiModel.description = description;
	}

	get tags(): string[] {
		return this.apiModel.tags;
	}
	set tags(tags: string[]) {
		this.apiModel.tags = tags;
	}

	get badges(): Array<{ badge: any; order: number }> {
		return this.apiModel.badges;
	}

	get issuer_id() {
		return this.apiModel.issuer_id;
	}

	get issuer_name(){
		return this.apiModel.issuer_name;
	}

	get progress(): number | null {
		return this.apiModel.progress;
	}

	get completed_at(): Date | null {
		return this.apiModel.completed_at;
	}
	get requested(): Boolean | null {
		return this.apiModel.requested;
	}

	get participationBadgeId(): string {
		return this.apiModel.participationBadge_id
	}

	get participationBadgeImage(): string {
		return this.apiModel.participationBadge_image
	}

	get issuerOwnerAcceptedTos(): boolean {
		return this.apiModel.issuerOwnerAcceptedTos;
	}

	

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiLearningPath = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': '',
			slug: this.apiModel.slug,
		};
	}
}
