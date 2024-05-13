import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable()
export class PdfService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
        private sanitizer: DomSanitizer
	) {
		super(loginService, http, configService, messageService);
	}

	getPdf(): Promise<SafeResourceUrl> {
        const headers = new HttpHeaders().set('Accept', 'application/pdf');
        return this.get('/v1/earner/pdf', {responseType: 'blob'})
          .then((response: HttpResponse<Blob>) => {
            const url = URL.createObjectURL(response.body);
            return this.sanitizer.bypassSecurityTrustResourceUrl(url);
          })
          .catch((error) => {
            throw new Error(error.message);
          });
      }
}
