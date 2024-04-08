import { ApiExternalTool } from './externaltools-api.model';
import { ManagedEntity } from '../../common/model/managed-entity';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { ApiEntityRef } from '../../common/model/entity-ref';

export class ExternalTool extends ManagedEntity<ApiExternalTool, ApiEntityRef> {
	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': this.apiModel.slug,
			slug: this.apiModel.slug,
		};
	}

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiExternalTool = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	get name(): string {
		return this.apiModel.name;
	}

	get clientId(): string {
		return this.apiModel.client_id;
	}

	get launchpoints() {
		return this.apiModel.launchpoints;
	}
}
