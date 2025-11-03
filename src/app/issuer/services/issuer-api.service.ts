import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { ApiIssuer, ApiIssuerForCreation, ApiIssuerStaffOperation, IssuerSlug } from '../models/issuer-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { ApiBadgeClassNetworkShare } from '../models/badgeclass-api.model';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class IssuerApiService extends BaseHttpApiService {
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

	createIssuer(creationIssuer: ApiIssuerForCreation) {
		return this.post<ApiIssuer>(`/v1/issuer/issuers`, creationIssuer).then((r) => r.body);
	}

	editIssuer(issuerSlug: IssuerSlug, editingIssuer: ApiIssuerForCreation) {
		return this.put<ApiIssuer>(`/v1/issuer/issuers/${issuerSlug}`, editingIssuer).then((r) => r.body);
	}

	deleteIssuer(issuerSlug: IssuerSlug) {
		return this.delete<null>(`/v1/issuer/issuers/${issuerSlug}`).then((r) => r.body);
	}

	listIssuers() {
		return this.get<ApiIssuer[]>(`/v1/issuer/issuers`).then((r) => r.body);
	}

	listAllIssuers() {
		return this.get<ApiIssuer[]>(`/public/all-issuers`, {}, false).then((r) => r.body);
	}

	getIssuer(issuerSlug: string) {
		return this.get<ApiIssuer>(`/v1/issuer/issuers/${issuerSlug}`).then((r) => r.body);
	}

	updateStaff(issuerSlug: IssuerSlug, updateOp: ApiIssuerStaffOperation) {
		return this.post(`/v1/issuer/issuers/${issuerSlug}/staff`, updateOp).then((r) => r.body);
	}

	listSharedNetworkBadges(issuerSlug: string) {
		return this.get<ApiBadgeClassNetworkShare[]>(`/v1/issuer/issuers/${issuerSlug}/networks/shared-badges`).then(
			(r) => r.body,
		);
	}
}
