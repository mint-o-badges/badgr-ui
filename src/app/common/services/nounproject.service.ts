import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { NounProjectIcon } from '../model/nounproject.model';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { AUTH_PROVIDER, AuthenticationService } from './authentication-service';

@Injectable({ providedIn: 'root' })
export class NounprojectService extends BaseHttpApiService {
	constructor(
		@Inject(AUTH_PROVIDER)
		protected loginService: AuthenticationService,
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
