import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
        return this.post(`/issuerStaffRequest/${issuerId}`, null);
    }

    getIssuerStaffRequests() {
        return this.get(`/issuerStaffRequest`);
    }

    // getBadgeRequestsCountByBadgeClass(badgeClassSlug: BadgeClassSlug) {
    //     return this.get(`/badgeRequests/${badgeClassSlug}`);
    // }

    deleteRequest(requestId: string) {
        return this.delete(`/deleteBadgeRequest/${requestId}`);
    }

    deleteRequests(issuerSlug: string, badgeSlug: string, requestIds: string[]){
        return this.post(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/requests`, {ids: requestIds})
    }
}