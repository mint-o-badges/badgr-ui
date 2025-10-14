import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { AUTH_PROVIDER, AuthenticationService } from './authentication-service';

@Injectable({ providedIn: 'root' })
export class ServerTimestampService extends BaseHttpApiService {
	constructor(
		@Inject(AUTH_PROVIDER)
		protected loginService: AuthenticationService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}
	getServerTimestamp(): Promise<string> {
		return this.get<string>(
			'/get-server-timestamp',
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
