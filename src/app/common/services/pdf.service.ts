import { HttpClient } from '@angular/common/http';
import { Injectable, SecurityContext } from '@angular/core';
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
            // sanitize the url before avoiding security check
            const safe_url = this.sanitizer.sanitize(SecurityContext.URL, url);
            return this.sanitizer.bypassSecurityTrustResourceUrl(safe_url);
          })
        );
  }
  
  downloadPdf(pdfSrc: SafeResourceUrl, badgeName: string, issueDate: Date) {
    const link = document.createElement('a');
    // https://stackoverflow.com/questions/55849415/type-saferesourceurl-is-not-assignable-to-type-string
    const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, pdfSrc);
    link.href = url;
    link.download = badgeName + ' - ' + this.dateToString(issueDate, '') + '.pdf';
    link.click();
  }

  dateToString(date: Date, seperator: string) {
    return (
      ('0' + date.getDate()).slice(-2) +
      seperator +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      seperator +
      date.getFullYear()
    );
  }
}
