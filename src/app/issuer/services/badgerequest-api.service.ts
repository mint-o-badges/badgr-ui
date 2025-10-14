import { Inject, Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { AppConfigService } from '../../common/app-config.service';
import { BadgeClassSlug } from '../models/badgeclass-api.model';
import { BadgeRequest } from '../models/badgerequest-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class BadgeRequestApiService extends BaseHttpApiService {
	constructor(
		@Inject(AUTH_PROVIDER)
		protected loginService: AuthenticationService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	requestBadge(qrCodeId: string, userData: BadgeRequest) {
		return this.post(`/request-badge/${qrCodeId}`, JSON.stringify(userData), null, new HttpHeaders(), false, false);
	}

	getBadgeRequestsByQrCode(qrCodeId: string) {
		return this.get(`/request-badge/${qrCodeId}`);
	}

	getBadgeRequestsCountByBadgeClass(badgeClassSlug: BadgeClassSlug) {
		return this.get(`/badgeRequests/${badgeClassSlug}`);
	}

	deleteRequest(requestId: string) {
		return this.delete(`/deleteBadgeRequest/${requestId}`);
	}

	deleteRequests(issuerSlug: string, badgeSlug: string, requestIds: string[]) {
		return this.post(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/requests`, { ids: requestIds });
	}
}
