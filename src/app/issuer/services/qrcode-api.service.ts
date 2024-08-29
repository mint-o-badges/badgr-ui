import { Injectable, SecurityContext } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { ApiQRCode } from '../models/qrcode-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable()
export class QrCodeApiService extends BaseHttpApiService {
    constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
		private sanitizer: DomSanitizer
	) {
		super(loginService, http, configService, messageService);
	}

	getQrCode(qrSlug: string) {
		return this.get<ApiQRCode>(`/v1/issuer/qrcode/${qrSlug}`).then((r) => r.body);
	}

    createQrCode(issuerSlug: string, badgeClassSlug: string, qrCode: ApiQRCode) {
		return this.post<ApiQRCode>(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClassSlug}/qrcodes`, qrCode).then(
			(r) => r.body,
		);
	}

	updateQrCode(issuerSlug: string, badgeClassSlug: string, qrCodeSlug: string, updatedQrCode: ApiQRCode) {
		return this.put<ApiQRCode>(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClassSlug}/qrcodes/${qrCodeSlug}`, updatedQrCode).then(
			(r) => r.body
		);
	}

	deleteQrCode(issuerSlug: string, badgeClassSlug: string, qrCodeSlug: string) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClassSlug}/qrcodes/${qrCodeSlug}`);
	}

	getQrCodesForIssuerByBadgeClass(issuerSlug: string, badgeClassSlug: string) {
		return this.get<ApiQRCode[]>(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClassSlug}/qrcodes`).then((r) => r.body);
	}

	// getQrCodePdf(slug: string, badgeName: string, base64QrImage: string) {
    //     return this.http.post<any>(`${this.baseUrl}/download-qrcode/${slug}/${badgeName}`, base64QrImage).then((response) => {
			
	// 	});
  	// }

	getQrCodePdf(slug: string, badgeSlug: string, base64QrImage: string) {
		return this.post<any>(`/download-qrcode/${slug}/${badgeSlug}`, base64QrImage)
	}

	downloadQrCode(pdfSrc: SafeResourceUrl, qrCodeName: string, badgeName: string) {
		const link = document.createElement('a');
		// https://stackoverflow.com/questions/55849415/type-saferesourceurl-is-not-assignable-to-type-string
		const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, pdfSrc);
		link.href = url;
		link.download = qrCodeName + '.pdf';
		link.click();
	 }
}