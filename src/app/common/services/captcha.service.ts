import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { Payload } from '../model/captcha.model';

@Injectable()
export class CaptchaService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getCaptcha(): Promise<Payload> {
		return this.get<Payload>(`/altcha`, null, false).then(
			(r) => r.body as Payload,
			(error) => {
				throw new Error(JSON.parse(error.message).error);
			},
		);
	}
}
