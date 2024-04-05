import { Injectable } from '@angular/core';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { ApiRecipientBadgeInstance, RecipientBadgeInstanceCreationInfo } from '../models/recipient-badge-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RecipientBadgeApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	listRecipientBadges() {
		return this.get<ApiRecipientBadgeInstance[]>(`/v1/earner/badges?json_format=plain&include_pending=true`).then(
			(r) => r.body,
		);
	}

	removeRecipientBadge(instanceSlug: string): Promise<void> {
		return this.delete(`/v1/earner/badges/${instanceSlug}`).then((r) => void 0);
	}

	addRecipientBadge(badgeInfo: RecipientBadgeInstanceCreationInfo) {
		return this.post<ApiRecipientBadgeInstance>('/v1/earner/badges?json_format=plain', badgeInfo).then(
			(r) => r.body,
		);
	}

	saveInstance(apiModel: ApiRecipientBadgeInstance) {
		return this.put<ApiRecipientBadgeInstance>(`/v1/earner/badges/${apiModel.id}?json_format=plain`, apiModel).then(
			(r) => r.body,
		);
	}

	getBadgeShareUrlForProvider(objectIdUrl, shareServiceType, includeIdentifier): Promise<string> {
		const idUrl = objectIdUrl.replace(/.*\//, '');
		const include_identifier = includeIdentifier ? '&include_identifier=1' : '';
		return this.get<{ url: string }>(
			`/v1/earner/share/badge/${idUrl}?provider=${shareServiceType}&source=badgr-ui&redirect=0${include_identifier}`,
		).then((r) => r.body.url);
	}

	getCollectionShareUrlForProvider(objectIdUrl, shareServiceType): Promise<string> {
		const idUrl = objectIdUrl.replace(/.*\//, '');
		return this.get<{ url: string }>(
			`/v1/earner/share/collection/${idUrl}?provider=${shareServiceType}&source=badgr-ui&redirect=0`,
		).then((r) => r.body.url);
	}
}
