import { Inject, Injectable } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { ApiAppIntegration } from '../models/app-integration-api.model';
import { flatten } from '../../common/util/array-reducers';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class AppIntegrationApiService extends BaseHttpApiService {
	constructor(
		@Inject(AUTH_PROVIDER)
		protected loginService: AuthenticationService,
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
