import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { ApiAppIntegration } from '../models/app-integration-api.model';
import { flatten } from '../../common/util/array-reducers';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class AppIntegrationApiService extends BaseHttpApiService {
	protected loginService: AuthenticationService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(AUTH_PROVIDER);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);

		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	listIntegratedApps(): Promise<ApiAppIntegration[]> {
		return Promise.all(
			(this.configService.apiConfig.integrationEndpoints || []).map((endpoint) =>
				this.get<ApiAppIntegration[]>(endpoint).then((response) => response.body),
			),
		).then((lists) => lists.reduce(flatten<ApiAppIntegration>(), []));
	}
}
