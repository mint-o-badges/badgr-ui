import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BadgeClassSlug } from '../models/badgeclass-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

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
    
    requestBadge(badgeClassSlug: BadgeClassSlug, userData: any) {
        return this.post(`/request-badge/${badgeClassSlug}`, userData);
    }

    getBadgeRequests(badgeClassSlug: string) {
        return this.get(`/request-badge/${badgeClassSlug}`);
    }
}