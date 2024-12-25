import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BadgeClassSlug } from '../models/badgeclass-api.model';
import { BadgeRequest } from '../models/badgerequest-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class BadgeRequestApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
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

	deleteRequests(requestIds: string[]){
		return this.post('/deleteBadgeRequests', {ids: requestIds})
	}
}