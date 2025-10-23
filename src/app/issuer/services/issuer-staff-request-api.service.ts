import { Injectable, inject } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { ApiStaffRequest } from '../models/staffrequest-api.model';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class IssuerStaffRequestApiService extends BaseHttpApiService {
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

	requestIssuerStaffMembership(issuerId: string) {
		return this.post(`/v1/user/issuerStaffRequest/issuer/${issuerId}`, null);
	}

	getStaffRequestsByIssuer(issuerSlug: string) {
		return this.get<ApiStaffRequest[]>(`/v1/issuer/issuers/${issuerSlug}/staffRequests`);
	}

	confirmRequest(issuerSlug: string, requestId: string) {
		return this.put(`/v1/issuer/issuers/${issuerSlug}/staffRequests/${requestId}/confirm`, null);
	}

	deleteRequest(issuerSlug: string, requestId: string) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/staffRequests/${requestId}`);
	}
}
