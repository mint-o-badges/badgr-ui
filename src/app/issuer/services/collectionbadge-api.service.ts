import { Injectable } from '@angular/core';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { ApiCollectionBadge } from '../models/collectionbadge-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CollectionBadgeApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	listCollectionBadges() {
		return this.get<ApiCollectionBadge[]>(`/public/all-collectionbadges?json_format=plain`).then((r) => r.body);
	}

	saveCollectionBadge(apiModel: ApiCollectionBadge) {
		return this.put<ApiCollectionBadge>(
			`/public/all-collectionbadges/${apiModel.slug}?json_format=plain`,
			apiModel,
		).then((r) => r.body);
	}
}
