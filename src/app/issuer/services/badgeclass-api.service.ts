import { Injectable } from '@angular/core';
import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { SessionService } from '../../common/services/session.service';
import { AppConfigService } from '../../common/app-config.service';
import { IssuerSlug } from '../models/issuer-api.model';
import { ApiBadgeClass, ApiBadgeClassForCreation, BadgeClassSlug } from '../models/badgeclass-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BadgeClassApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
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

	getBadgeForIssuerSlugAndBadgeSlug(issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug) {
		return this.get<ApiBadgeClass>('/v1/issuer/issuers/' + issuerSlug + '/badges/' + badgeSlug).then((r) => r.body);
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
}
