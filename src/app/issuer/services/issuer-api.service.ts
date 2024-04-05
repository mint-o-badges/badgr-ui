import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { SessionService } from '../../common/services/session.service';
import { ApiIssuer, ApiIssuerForCreation, ApiIssuerStaffOperation, IssuerSlug } from '../models/issuer-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class IssuerApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	createIssuer(creationIssuer: ApiIssuerForCreation) {
		return this.post<ApiIssuer>(`/v1/issuer/issuers`, creationIssuer).then((r) => r.body);
	}

	editIssuer(issuerSlug: IssuerSlug, editingIssuer: ApiIssuerForCreation) {
		return this.put<ApiIssuer>(`/v1/issuer/issuers/${issuerSlug}`, editingIssuer).then((r) => r.body);
	}

	deleteIssuer(issuerSlug: IssuerSlug) {
		return this.delete<null>(`/v1/issuer/issuers/${issuerSlug}`).then((r) => r.body);
	}

	listIssuers() {
		return this.get<ApiIssuer[]>(`/v1/issuer/issuers`).then((r) => r.body);
	}

	listAllIssuers() {
		return this.get<ApiIssuer[]>(`/public/all-issuers`, {}, false).then((r) => r.body);
	}

	getIssuer(issuerSlug: string) {
		return this.get<ApiIssuer>(`/v1/issuer/issuers/${issuerSlug}`).then((r) => r.body);
	}

	updateStaff(issuerSlug: IssuerSlug, updateOp: ApiIssuerStaffOperation) {
		return this.post(`/v1/issuer/issuers/${issuerSlug}/staff`, updateOp).then((r) => r.body);
	}
}
