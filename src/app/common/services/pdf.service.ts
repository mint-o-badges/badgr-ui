import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { BaseHttpApiService } from './base-http-api.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, map } from 'rxjs';

@Injectable()
export class PdfService {
	baseUrl: string;

	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
    private sanitizer: DomSanitizer
	) {
    this.baseUrl = this.configService.apiConfig.baseUrl
  }

	getPdf(slug: string): Observable<SafeResourceUrl> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.loginService.currentAuthToken.access_token}`);
        return this.http.get(`${this.baseUrl}/v1/earner/badges/pdf/${slug}`, { headers: headers, responseType: 'blob' }).pipe(
          map((response: Blob) => {
            const url = URL.createObjectURL(response);
            return this.sanitizer.bypassSecurityTrustResourceUrl(url);
          })
        );
      }
}
