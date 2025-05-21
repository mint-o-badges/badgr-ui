import { HttpClient } from '@angular/common/http';
import { Injectable, SecurityContext } from '@angular/core';
import { AppConfigService } from '../app-config.service';
import { MessageService } from './message.service';
import { SessionService } from './session.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PdfService {
	baseUrl: string;

	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		private sanitizer: DomSanitizer,
	) {
		this.baseUrl = this.configService.apiConfig.baseUrl;
	}

	getPdf(slug: string): Promise<SafeResourceUrl> {
		return this.http
			.get(`${this.baseUrl}/v1/earner/badges/pdf/${slug}`, {
				responseType: 'blob',
				withCredentials: true,
			})
			.pipe(
				map((response: Blob) => {
					const url = URL.createObjectURL(response);
					// sanitize the url before avoiding security check
					const safe_url = this.sanitizer.sanitize(SecurityContext.URL, url);
					return this.sanitizer.bypassSecurityTrustResourceUrl(safe_url);
				}),
			)
			.toPromise();
	}

	downloadPdf(pdfSrc: SafeResourceUrl, badgeName: string, issueDate: Date) {
		const link = document.createElement('a');
		// https://stackoverflow.com/questions/55849415/type-saferesourceurl-is-not-assignable-to-type-string
		const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, pdfSrc);
		link.href = url;
		link.download = `${issueDate.toISOString().split('T')[0]}-${badgeName}.pdf`;
		link.click();
	}
}
