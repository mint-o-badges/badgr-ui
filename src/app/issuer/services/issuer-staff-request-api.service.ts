import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiStaffRequest } from '../staffrequest-api.model';
import { request } from 'http';

@Injectable()
export class IssuerStaffRequestApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	requestIssuerStaffMembership(issuerId: string) {
		return this.post(`/v1/user/issuerStaffRequest/${issuerId}`, null);
	}

	getStaffRequestsByIssuer(issuerSlug: string) {
		return this.get<ApiStaffRequest[]>(`/v1/issuer/issuers/${issuerSlug}/staffRequests`);
	}

	// getBadgeRequestsCountByBadgeClass(badgeClassSlug: BadgeClassSlug) {
	//     return this.get(`/badgeRequests/${badgeClassSlug}`);
	// }

	confirmRequest(issuerSlug: string, requestId: string) {
		return this.put(`/v1/issuer/issuers/${issuerSlug}/staffRequests/${requestId}/confirm`, null);
	}

	deleteRequest(issuerSlug: string, requestId: string) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/staffRequests/${requestId}`);
	}
}
