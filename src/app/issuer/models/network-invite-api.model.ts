import { ApiIssuer, ApiNetwork } from './issuer-api.model';

export interface ApiNetworkInvitation {
	id?: number;
	entity_version?: number;
	entity_id: string;
	issuer: ApiIssuer;
	invitedOn: string;
	acceptedOn: string;
	status: string;
	revoked: boolean;
	network: ApiNetwork;
}
