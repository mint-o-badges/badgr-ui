import { ManagedEntity } from '../../common/model/managed-entity';
import {
	ApiAppIntegration,
	ApiAppIntegrationRef,
	ApiAppIntegrationUid,
	ApiBadgebookCanvasLti1AppIntegration,
	AppIntegrationType,
	isApiBadgebookCanvasLti1AppIntegration,
} from './app-integration-api.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

export abstract class AppIntegration<T extends ApiAppIntegration> extends ManagedEntity<T, ApiAppIntegrationRef> {
	abstract name: string;
	abstract description: string;
	abstract active: boolean;
	abstract image: string;

	static idForApiModel(apiModel: ApiAppIntegration): string {
		return apiModel.integrationUid || apiModel.integrationType;
	}

	static integrationFor(
		commonManager: CommonEntityManager,
		apiModel: ApiAppIntegration,
	): AppIntegration<ApiAppIntegration> {
		if (isApiBadgebookCanvasLti1AppIntegration(apiModel)) {
			return new BadebookLti1Integration(commonManager, apiModel);
		} else {
			return new UnknownLti1Integration(commonManager, apiModel);
		}
	}

	constructor(commonManager: CommonEntityManager, initialEntity?: T, onUpdateSubscribed?: () => void) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiAppIntegrationRef {
		return {
			'@id': AppIntegration.idForApiModel(this.apiModel),
			slug: AppIntegration.idForApiModel(this.apiModel),
		};
	}

	get integrationType(): AppIntegrationType {
		return this.apiModel.integrationType;
	}

	get integrationUid(): ApiAppIntegrationUid | null {
		return this.apiModel.integrationUid;
	}

	get integrationData(): object {
		return this.apiModel.integrationData;
	}
}

export class UnknownLti1Integration extends AppIntegration<ApiAppIntegration> {
	get name() {
		return this.integrationUid ? `${this.integrationType}: ${this.integrationUid}` : `${this.integrationType}`;
	}
	description = 'Unknown integration';
	active = true;
	image = '../../../breakdown/static/images/placeholderavatar-issuer.svg';
}

export class BadebookLti1Integration extends AppIntegration<ApiBadgebookCanvasLti1AppIntegration> {
	name = 'Canvas LTI';
	description = 'Badgr connects with Canvas LTI to automatically award badges to students as they complete modules.';
	active = true;
	image = '../../../breakdown/static/images/canvas-icon.svg';

	get consumerKey() {
		return this.apiModel.integrationData.credential.client_id;
	}
	get sharedSecret() {
		return this.apiModel.integrationData.credential.client_secret;
	}
	get configUrl() {
		return this.apiModel.integrationData.config_url;
	}
}
