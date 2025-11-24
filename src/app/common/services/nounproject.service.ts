import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { NounProjectIcon } from '../model/nounproject.model';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { AUTH_PROVIDER, AuthenticationService } from './authentication-service';

@Injectable({ providedIn: 'root' })
export class NounprojectService extends BaseHttpApiService {
	protected loginService: AuthenticationService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(AUTH_PROVIDER);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);

		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	getNounProjectIcons(searchterm, page): Promise<NounProjectIcon[]> {
		return this.get<{ icons: NounProjectIcon[] }>(`/nounproject/${searchterm}/${page}`).then(
			(r) => r.body.icons as NounProjectIcon[],
			(error) => [],
		);
	}
}
