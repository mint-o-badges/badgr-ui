import { Injectable, inject } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { IssuerSlug } from '../models/issuer-api.model';
import {
	ApiBadgeClass,
	ApiBadgeClassForCreation,
	BadgeClassSlug,
	BadgeImageResponse,
} from '../models/badgeclass-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BadgeClassApiService extends BaseHttpApiService {
	protected loginService: SessionService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(SessionService);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);

		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	getAllUserBadgeClasses() {
		return this.get<ApiBadgeClass[]>('/v1/issuer/all-badges').then((r) => r.body);
	}

	getAllBadgeClasses() {
		return this.get<ApiBadgeClass[]>(`/public/all-badges?exclude_orgImg=true`, {}, false).then((r) => r.body);
	}

	getBadgesForIssuer(issuerSlug?: IssuerSlug) {
		return this.get<ApiBadgeClass[]>('/v1/issuer/issuers/' + issuerSlug + '/badges').then((r) => r.body);
	}

	getAwardableBadgesForIssuer(issuerSlug: string) {
		return this.get<ApiBadgeClass[]>('/v1/issuer/issuers/' + issuerSlug + '/awardable-badges').then((r) => r.body);
	}

	getBadgeForIssuerSlugAndBadgeSlug(issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug) {
		return this.get<ApiBadgeClass>('/v1/issuer/issuers/' + issuerSlug + '/badges/' + badgeSlug).then((r) => r.body);
	}

	getNetworkBadgeClasses(networkSlug: string) {
		return this.get<ApiBadgeClass[]>(`/v1/issuer/networks/${networkSlug}/badges`).then((r) => r.body);
	}

	deleteBadgeClass(issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug) {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}`);
	}

	createBadgeClass(issuerSlug: IssuerSlug, badgeClass: ApiBadgeClassForCreation) {
		const badgeClassWithExtensions: ApiBadgeClassForCreation = {
			...badgeClass,
			...badgeClass.extensions,
		};
		return this.post<ApiBadgeClass>(`/v1/issuer/issuers/${issuerSlug}/badges`, badgeClassWithExtensions).then(
			(r) => r.body,
		);
	}

	createBadgeImage(issuerSlug: string, badgeSlug: string, category: string, useIssuerImage: boolean) {
		return this.post(`/v1/issuer/issuers/${issuerSlug}/badges/image/compose`, {
			issuerSlug: issuerSlug,
			badgeSlug: badgeSlug,
			category: category,
			useIssuerImage: useIssuerImage,
		}).then((r) => r.body as BadgeImageResponse);
	}

	updateBadgeClass(issuerSlug: IssuerSlug, badgeClass: ApiBadgeClass) {
		const badgeClassWithExtensions: ApiBadgeClassForCreation = {
			...badgeClass,
			...badgeClass.extensions,
		};
		return this.put<ApiBadgeClass>(
			`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClass.slug}`,
			badgeClassWithExtensions,
		).then((r) => r.body);
	}

	getBadgeById(id: BadgeClassSlug) {
		return this.get<ApiBadgeClass>('/v1/issuer/all-badges/find?identifier=' + id).then((r) => r.body);
	}

	getSharedBadgesInNetwork(networkId: string): Promise<ApiBadgeClass[]> {
		return this.get<ApiBadgeClass[]>(`/v1/issuer/issuers/${networkId}/shared-badges/`).then((r) => r.body);
	}

	shareOnNetwork(networkSlug: string, badgeSlug: string) {
		return this.post(`/v1/issuer/networks/${networkSlug}/badges/${badgeSlug}/share`, {}).then((r) => r.body);
	}
}
