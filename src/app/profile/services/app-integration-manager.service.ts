import { forwardRef, Inject, Injectable } from '@angular/core';
import { ApiAppIntegration } from '../models/app-integration-api.model';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { AppIntegration } from '../models/app-integration.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { AppIntegrationApiService } from './app-integration-api.service';

@Injectable({
	providedIn: 'root',
})
export class AppIntegrationManager {
	appIntegrations = new StandaloneEntitySet<AppIntegration<ApiAppIntegration>, ApiAppIntegration>(
		(apiEntity) => AppIntegration.integrationFor(this.commonManager, apiEntity),
		AppIntegration.idForApiModel,
		() => this.appIntegrationService.listIntegratedApps(),
	);

	constructor(
		@Inject(forwardRef(() => CommonEntityManager))
		protected commonManager: CommonEntityManager,
		protected appIntegrationService: AppIntegrationApiService,
	) {}
}
