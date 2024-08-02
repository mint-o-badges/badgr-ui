import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { ApiQRCode } from '../models/qrcode-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class QrCodeApiService extends BaseHttpApiService {
    constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

    createQrCode(qrCode: ApiQRCode) {
		return this.post<ApiQRCode>(``, qrCode).then(
			(r) => r.body,
		);
	}
}