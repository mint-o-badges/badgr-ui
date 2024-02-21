import {Injectable} from '@angular/core';
import {SessionService} from '../../common/services/session.service';
import {AppConfigService} from '../../common/app-config.service';
import {BaseHttpApiService} from '../../common/services/base-http-api.service';
import { ApiSuperBadge } from '../models/superbadge-api.model';
import {MessageService} from '../../common/services/message.service';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class SuperBadgeApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listSuperBadges() {
		return this
			.get<ApiSuperBadge[]>(`/public/all-superbadges?json_format=plain`)
			.then(r => r.body);
	}

	removeSuperBadge(superBadgeSlug: string): Promise<void> {
		return this
			.delete(`/v1/earner/collections/${superBadgeSlug}`)
			.then(r => void 0);
	}

	addSuperBadge(
		badgeInfo: ApiSuperBadge
	) {
		return this
			.post<ApiSuperBadge>('/v1/earner/collections?json_format=plain', badgeInfo)
			.then(r => r.body);
	}

	saveSuperBadge(
		apiModel: ApiSuperBadge
	) {
		return this
			.put<ApiSuperBadge>(`/public/all-superbadges/${apiModel.slug}?json_format=plain`, apiModel)
			.then(r => r.body);
	}
}

