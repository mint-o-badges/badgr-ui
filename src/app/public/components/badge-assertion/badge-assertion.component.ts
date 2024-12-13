import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { preloadImageURL } from '../../../common/util/file-util';
import { PublicApiService } from '../../services/public-api.service';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';
import {
	PublicApiBadgeAssertionWithBadgeClass,
	PublicApiBadgeClass,
	PublicApiIssuer,
} from '../../models/public-api.model';
import { EmbedService } from '../../../common/services/embed.service';
import { routerLinkForUrl } from '../public/public.component';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { saveAs } from 'file-saver';
import { Title } from '@angular/platform-browser';
import { VerifyBadgeDialog } from '../verify-badge-dialog/verify-badge-dialog.component';
import { BadgeClassCategory, BadgeClassLevel } from './../../../issuer/models/badgeclass-api.model';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';

@Component({
	template: `<verify-badge-dialog
			#verifyBadgeDialog
			(verifiedBadgeAssertion)="onVerifiedBadgeAssertion($event)"
		></verify-badge-dialog>
		<bg-badgedetail [config]="config" [awaitPromises]="[assertionIdParam]"></bg-badgedetail>`,
})
export class PublicBadgeAssertionComponent {
	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public messageService: MessageService,
		public configService: AppConfigService,
		public queryParametersService: QueryParametersService,
		private title: Title,
	) {
		title.setTitle(`Assertion - ${this.configService.theme['serviceName'] || 'Badgr'}`);
		this.assertionIdParam = this.createLoadedRouteParam();
	}

	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);

	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	@ViewChild('verifyBadgeDialog')
	verifyBadgeDialog: VerifyBadgeDialog;

	assertionIdParam: LoadedRouteParam<PublicApiBadgeAssertionWithBadgeClass>;

	assertionId: string;

	awardedToDisplayName: string;

	config: PageConfig;

	routerLinkForUrl = routerLinkForUrl;

	tense = {
		expires: {
			'=1': 'Expired',
			'=0': 'Expires',
		},
	};

	categoryOptions: { [key in BadgeClassCategory]: string } = {
		competency: 'Kompetenz-Badge',
		participation: 'Teilnahme-Badge',
	};

	levelOptions: { [key in BadgeClassLevel]: string } = {
		a1: 'A1 Einsteiger*in',
		a2: 'A2 Entdecker*in',
		b1: 'B1 Insider*in',
		b2: 'B2 Expert*in',
		c1: 'C1 Leader*in',
		c2: 'C2 Vorreiter*in',
	};

	get showDownload() {
		return this.queryParametersService.queryStringValue('action') === 'download';
	}

	get assertion(): PublicApiBadgeAssertionWithBadgeClass {
		return this.assertionIdParam.value;
	}

	get badgeClass(): PublicApiBadgeClass {
		return this.assertion.badge;
	}

	get issuer(): PublicApiIssuer {
		return this.assertion.badge.issuer;
	}

	get isExpired(): boolean {
		return !this.assertion.expires || new Date(this.assertion.expires) < new Date();
	}

	private get rawUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.assertionId}`;
	}

	private get rawJsonUrl() {
		return `${this.rawUrl}.json`;
	}

	get rawBakedUrl() {
		return `${this.rawUrl}/baked`;
	}

	get verifyUrl() {
		let url = `${this.configService.assertionVerifyUrl}?url=${this.rawJsonUrl}`;

		for (const IDENTITY_TYPE of ['identity__email', 'identity__url', 'identity__telephone']) {
			const identity = this.queryParametersService.queryStringValue(IDENTITY_TYPE);
			if (identity) {
				url = `${url}&${IDENTITY_TYPE}=${identity}`;
			}
		}
		return url;
	}

	onVerifiedBadgeAssertion(ba) {
		this.assertionIdParam = this.createLoadedRouteParam();
	}

	verifyBadge() {
		this.verifyBadgeDialog.openDialog(this.assertion);
	}

	generateFileName(assertion, fileExtension): string {
		return `${assertion.badge.name} - ${assertion.recipient.identity}${fileExtension}`;
	}

	openSaveDialog(assertion): void {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', assertion.image, true);
		xhr.responseType = 'blob';
		xhr.onload = (e) => {
			if (xhr.status === 200) {
				const fileExtension = this.mimeToExtension(xhr.response.type);
				const name = this.generateFileName(assertion, fileExtension);
				saveAs(xhr.response, name);
			}
		};
		xhr.send();
	}

	mimeToExtension(mimeType: string): string {
		if (mimeType.indexOf('svg') !== -1) return '.svg';
		if (mimeType.indexOf('png') !== -1) return '.png';
		return '';
	}

	private createLoadedRouteParam() {
		return new LoadedRouteParam(this.injector.get(ActivatedRoute), 'assertionId', (paramValue) => {
			this.assertionId = paramValue;
			const service: PublicApiService = this.injector.get(PublicApiService);
			return service.getBadgeAssertion(paramValue).then((assertion) => {
				this.config = {
					badgeTitle: assertion.badge.name,
					headerButton: {
						title: 'Verify Badge',
						action: () => this.verifyBadge(),
					},
					menuitems: [
						{
							title: 'Download JSON',
							icon: 'lucideDownload',
							action: () => {
								fetch(this.rawJsonUrl)
									.then((response) => response.blob())
									.then((blob) => {
										const link = document.createElement('a');
										const url = URL.createObjectURL(blob);
										link.href = url;
										link.download = 'badge-JSON.json';
										document.body.appendChild(link);
										link.click();
										document.body.removeChild(link);
										URL.revokeObjectURL(url);
									})
									.catch((error) => console.error('Download failed:', error));
							},
						},
						{
							title: 'Download baked Image',
							icon: 'lucideDownload',
							action: () => {
								fetch(this.rawBakedUrl)
									.then((response) => response.blob())
									.then((blob) => {
										const link = document.createElement('a');
										const url = URL.createObjectURL(blob);
										const urlParts = this.rawBakedUrl.split('/');
										const inferredFileName = urlParts[urlParts.length - 1] || 'downloadedFile';
										link.href = url;
										link.download = inferredFileName;
										document.body.appendChild(link);
										link.click();
										document.body.removeChild(link);
										URL.revokeObjectURL(url);
									})
									.catch((error) => console.error('Download failed:', error));
							},
						},
						{
							title: 'View Badge',
							icon: 'lucideBadge',
							routerLink: routerLinkForUrl(assertion.badge.hostedUrl || assertion.badge.id),
						},
					],
					badgeDescription: assertion.badge.description,
					issuerSlug: assertion.badge.issuer['slug'],
					slug: assertion.badge.id,
					category:
						assertion.badge['extensions:CategoryExtension'].Category === 'competency'
							? 'Kompetenz- Badge'
							: 'Teilnahme- Badge',
					tags: assertion.badge.tags,
					issuerName: assertion.badge.issuer.name,
					issuerImagePlacholderUrl: this.issuerImagePlacholderUrl,
					issuerImage: assertion.badge.issuer.image,
					badgeLoadingImageUrl: this.badgeLoadingImageUrl,
					badgeFailedImageUrl: this.badgeFailedImageUrl,
					badgeImage: assertion.badge.image,
					competencies: assertion.badge['extensions:CompetencyExtension'],
					license: assertion.badge['extensions:LicenseExtension'] ? true : false
				};
				if (assertion.revoked) {
					if (assertion.revocationReason) {
						this.messageService.reportFatalError('Assertion has been revoked:', assertion.revocationReason);
					} else {
						this.messageService.reportFatalError('Assertion has been revoked.', '');
					}
				} else if (this.showDownload) {
					this.openSaveDialog(assertion);
				}
				if (assertion['extensions:recipientProfile'] && assertion['extensions:recipientProfile'].name) {
					this.awardedToDisplayName = assertion['extensions:recipientProfile'].name;
				}
				return assertion;
			});
		});
	}
}
