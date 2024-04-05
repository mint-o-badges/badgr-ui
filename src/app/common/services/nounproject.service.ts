import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { NounProjectIcon } from '../model/nounproject.model';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';

@Injectable()
export class NounprojectService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getNounProjectIcons(searchterm, page): Promise<NounProjectIcon[]> {
		return this.get<{ icons: NounProjectIcon[] }>(`/nounproject/${searchterm}/${page}`).then(
			(r) => r.body.icons as NounProjectIcon[],
			(error) => [],
		);
	}
}
