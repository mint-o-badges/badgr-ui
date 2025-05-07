import { Injectable } from '@angular/core';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import {
	ApiRecipientBadgeCollection,
	ApiRecipientBadgeCollectionForCreation,
} from '../models/recipient-badge-collection-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RecipientBadgeCollectionApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	listRecipientBadgeCollections() {
		return this.get<ApiRecipientBadgeCollection[]>(`/v1/earner/collections?json_format=plain`).then((r) => r.body);
	}

	removeRecipientBadgeCollection(collectionSlug: string): Promise<void> {
		return this.delete(`/v1/earner/collections/${collectionSlug}`).then((r) => void 0);
	}

	addRecipientBadgeCollection(badgeInfo: ApiRecipientBadgeCollectionForCreation) {
		return this.post<ApiRecipientBadgeCollection>('/v1/earner/collections?json_format=plain', badgeInfo).then(
			(r) => r.body,
		);
	}

	saveRecipientBadgeCollection(apiModel: ApiRecipientBadgeCollection) {
		return this.put<ApiRecipientBadgeCollection>(
			`/v1/earner/collections/${apiModel.slug}?json_format=plain`,
			apiModel,
		).then((r) => r.body);
	}

	getCollectionBadges(collectionSlug: string){
		return this.get(`/v1/earner/collections/${collectionSlug}/badges`)
			.then((r) => r.body)
	}
}
