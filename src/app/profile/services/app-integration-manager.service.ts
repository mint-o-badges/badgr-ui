import { Injectable, inject } from '@angular/core';
import { ApiAppIntegration } from '../models/app-integration-api.model';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { AppIntegration } from '../models/app-integration.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { AppIntegrationApiService } from './app-integration-api.service';

@Injectable({ providedIn: 'root' })
export class AppIntegrationManager {
	protected commonManager = inject(CommonEntityManager);
	protected appIntegrationService = inject(AppIntegrationApiService);

	appIntegrations = new StandaloneEntitySet<AppIntegration<ApiAppIntegration>, ApiAppIntegration>(
		(apiEntity) => AppIntegration.integrationFor(this.commonManager, apiEntity),
		AppIntegration.idForApiModel,
		() => this.appIntegrationService.listIntegratedApps(),
	);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}
}
