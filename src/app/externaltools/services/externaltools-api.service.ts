import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import {
	ApiExternalTool,
	ApiExternalToolLaunchInfo,
	ApiExternalToolLaunchpoint,
} from '../models/externaltools-api.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ExternalToolsApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	listTools() {
		return this.get<ApiExternalTool[]>(`/v1/externaltools/`, null, false).then((r) => r.body);
	}

	getLaunchToolInfo(launchpoint: ApiExternalToolLaunchpoint, contextId: string) {
		return this.get<ApiExternalToolLaunchInfo>(`${launchpoint.url}?context_id=${contextId}`).then((r) => r.body);
	}
}
