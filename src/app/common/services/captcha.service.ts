import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { TranslateService } from '@ngx-translate/core';
import { Payload } from '../model/captcha.model';

@Injectable()
export class CaptchaService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		protected translate: TranslateService
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

	setupCaptcha(elementId: string, callback: (verified: boolean) => void): void {
		this.getCaptcha().then((captcha) => {
		  const captchaElement = document.querySelector(elementId);
		  captchaElement.addEventListener('statechange', (ev: any) => {
			if (ev.detail.state === 'verified') {
			  callback(true);
			}
		  });
		  // @ts-ignore
		  captchaElement.configure({
			challenge: {
				algorithm: captcha.algorithm,
				challenge: captcha.challenge,
				salt: captcha.salt,
				signature: captcha.signature,
			},
			strings: {
				error: this.translate.instant('Captcha.error'),
				footer: this.translate.instant('Captcha.footer'),
				label: this.translate.instant('Captcha.label'),
				verified: this.translate.instant('Captcha.verified'),
				verifying: this.translate.instant('Captcha.verifying'),
				waitAlert: this.translate.instant('Captcha.waitAlert'),
			},
		  });
		});
	  }
}
