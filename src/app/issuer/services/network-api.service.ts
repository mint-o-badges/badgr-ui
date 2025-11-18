import { BaseHttpApiService } from '../../common/services/base-http-api.service';
import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../../common/app-config.service';
import { MessageService } from '../../common/services/message.service';
import { HttpClient } from '@angular/common/http';
import { Issuer } from '../models/issuer.model';
import {
	ApiIssuer,
	ApiIssuerStaffOperation,
	ApiNetwork,
	ApiNetworkForCreation,
	IssuerSlug,
} from '../models/issuer-api.model';
import { ApiNetworkInvitation } from '../models/network-invite-api.model';
import { ApiBadgeClassNetworkShare } from '../models/badgeclass-api.model';
import { AUTH_PROVIDER, AuthenticationService } from '~/common/services/authentication-service';

@Injectable({ providedIn: 'root' })
export class NetworkApiService extends BaseHttpApiService {
	protected loginService: AuthenticationService;
	protected http: HttpClient;
	protected configService: AppConfigService;
	protected messageService: MessageService;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const loginService = inject(AUTH_PROVIDER);
		const http = inject(HttpClient);
		const configService = inject(AppConfigService);
		const messageService = inject(MessageService);

		super(loginService, http, configService, messageService);

		this.loginService = loginService;
		this.http = http;
		this.configService = configService;
		this.messageService = messageService;
	}

	createNetwork(creationNetwork: ApiNetworkForCreation) {
		return this.post<ApiNetwork>(`/v1/issuer/networks`, creationNetwork).then((r) => r.body);
	}

	editNetwork(issuerSlug: IssuerSlug, editingNetwork: ApiNetworkForCreation) {
		return this.put<ApiNetwork>(`/v1/issuer/networks/${issuerSlug}`, editingNetwork).then((r) => r.body);
	}

	deleteNetwork(issuerSlug: IssuerSlug) {
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
		return this.post(`/v1/issuer/networks/${networkSlug}/invites`, issuers).then((r) => r.body);
	}

	revokeInvitation(inviteSlug: string) {
		return this.delete(`/v1/issuer/networks/invites/${inviteSlug}`);
	}

	getNetworkInvite(inviteSlug: string) {
		return this.get<ApiNetworkInvitation>(`/v1/issuer/networks/invites/${inviteSlug}`).then((r) => r.body);
	}

	getNetworkInvites(networkSlug: string, status?: 'pending' | 'approved') {
		const statusParam = status ? `?status=${status}` : '';
		return this.get<ApiNetworkInvitation[]>(`/v1/issuer/networks/${networkSlug}/invites${statusParam}`).then(
			(r) => r.body,
		);
	}

	confirmInvitation(networkSlug: string, inviteSlug: string) {
		return this.put(`/v1/issuer/networks/${networkSlug}/invite/${inviteSlug}/confirm`, null);
	}

	updateStaff(networkSlug: IssuerSlug, updateOp: ApiIssuerStaffOperation) {
		return this.post(`/v1/issuer/networks/${networkSlug}/staff`, updateOp).then((r) => r.body);
	}

	getUserIssuersForNetwork(networkSlug: string) {
		return this.get<ApiIssuer[]>(`/v1/issuer/networks/${networkSlug}/issuers`).then((r) => r.body);
	}

	removeIssuerFromNetwork(networkSlug: string, issuerSlug: string) {
		return this.delete(`/v1/issuer/networks/${networkSlug}/issuer/${issuerSlug}`);
	}

	getIssuerNetworkBadges(issuerSlug: string) {
		return this.get<any[]>(`/v1/issuer/issuers/${issuerSlug}/network/badges`).then((r) => r.body);
	}

	/**
	 * Get all badges shared with a specific network
	 * @param networkId The network entity ID
	 * @returns Promise with array of badge shares for the network
	 */
	getNetworkSharedBadges(networkId: string): Promise<ApiBadgeClassNetworkShare[]> {
		return this.get<ApiBadgeClassNetworkShare[]>(`/v1/issuer/networks/${networkId}/shared-badges`).then(
			(r) => r.body,
		);
	}
}
