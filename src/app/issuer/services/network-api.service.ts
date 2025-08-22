import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { SessionService } from '../../common/services/session.service';
import {
	ApiNetwork,
	ApiNetworkForCreation,
	ApiNetworkForEditing,
	ApiNetworkStaffOperation,
	NetworkSlug,
} from '../models/network-api.model';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { Issuer } from '../models/issuer.model';
import { ApiIssuer } from '../models/issuer-api.model';
import { ApiNetworkInvitation } from '../models/network-invite-api.model';

@Injectable({ providedIn: 'root' })
export class NetworkApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: HttpClient,
		protected configService: AppConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	createNetwork(creationNetwork: ApiNetworkForCreation) {
		return this.post<ApiNetwork>(`/v1/issuer/networks`, creationNetwork).then((r) => r.body);
	}

	editNetwork(issuerSlug: NetworkSlug, editingNetwork: ApiNetworkForCreation) {
		return this.put<ApiNetwork>(`/v1/issuer/networks/${issuerSlug}`, editingNetwork).then((r) => r.body);
	}

	deleteNetwork(issuerSlug: NetworkSlug) {
		return this.delete<null>(`/v1/issuer/networks/${issuerSlug}`).then((r) => r.body);
	}

	listNetworks() {
		return this.get<ApiNetwork[]>(`/v1/issuer/networks`).then((r) => r.body);
	}

	listAllNetworks() {
		return this.get<ApiNetwork[]>(`/public/all-networks`, {}, false).then((r) => r.body);
	}

	getNetwork(networkSlug: string) {
		return this.get<ApiNetwork>(`/v1/issuer/networks/${networkSlug}`).then((r) => r.body);
	}

	inviteInstitutions(networkSlug: string, issuers: Issuer[]) {
		return this.post(`/v1/issuer/networks/${networkSlug}/invite`, issuers).then((r) => r.body);
	}

	revokeInvitation(networkSlug: string, inviteSlug: string) {
		return this.delete(`/v1/issuer/networks/${networkSlug}/invite/${inviteSlug}`);
	}

	getNetworkInvite(inviteSlug: string) {
		return this.get<ApiNetworkInvitation>(`/v1/issuer/networks/invites/${inviteSlug}`).then((r) => r.body);
	}

	getPendingNetworkInvites(networkSlug: string) {
		return this.get<ApiNetworkInvitation[]>(`/v1/issuer/networks/${networkSlug}/invites`).then((r) => r.body);
	}

	confirmInvitation(networkSlug: string, inviteSlug: string) {
		return this.put(`/v1/issuer/networks/${networkSlug}/invite/${inviteSlug}/confirm`, null);
	}

	updateStaff(networkSlug: NetworkSlug, updateOp: ApiNetworkStaffOperation) {
		return this.post(`/v1/issuer/networks/${networkSlug}/staff`, updateOp).then((r) => r.body);
	}

	getIssuersForNetwork(networkSlug: string) {
		return this.get<ApiIssuer[]>(`/v1/issuer/networks/${networkSlug}/issuer`).then((r) => r.body);
	}

	removeIssuerFromNetwork(networkSlug: string, issuerSlug: string) {
		return this.delete(`/v1/issuer/networks/${networkSlug}/issuer/${issuerSlug}`);
	}
}
