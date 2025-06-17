import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { AiSkillsResult, Skill } from '../model/ai-skills.model';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class ServerVersionService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}
	getServerVersion(): Promise<string> {
		return this.get<string>(
			'/get-server-version',
			null, // queryParams
			false, // requireAuth
			false, // useAuth
		).then(
			(r) => r.body['message'],
			(error) => {
				throw new Error(error);
			},
		);
	}
}
