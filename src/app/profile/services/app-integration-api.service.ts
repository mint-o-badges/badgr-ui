import { Injectable } from '@angular/core';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { ApiAppIntegration } from '../models/app-integration-api.model';
import { flatten } from '../../common/util/array-reducers';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppIntegrationApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	listIntegratedApps(): Promise<ApiAppIntegration[]> {
		return Promise.all(
			(this.configService.apiConfig.integrationEndpoints || []).map((endpoint) =>
				this.get<ApiAppIntegration[]>(endpoint).then((response) => response.body),
			),
		).then((lists) => lists.reduce(flatten<ApiAppIntegration>(), []));
	}
}
