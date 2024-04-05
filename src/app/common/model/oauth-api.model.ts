import { ApiEntityRef } from './entity-ref';

export type ApiOAuthResponse = ApiOAuth2AppInfo | ApiOAuth2ClientAuthorized;

export interface OAuth2RequestParams {
	clientId: string;
	redirectUrl: string;
	scopeString?: string;
	stateString?: string;
}

export interface ApiOAuth2AppInfo {
	scopes_descriptions: string[];
	scopes: string[];
	state: string;
	redirect_uri: string;
	response_type: 'code';
	client_id: string;
	application: ApiOAuthApplication;
}

export interface ApiOAuth2ClientAuthorized {
	success_url: string;
}

export interface OAuth2AppAuthorizationRef extends ApiEntityRef {}
export interface ApiOAuth2AppAuthorization {
	entityType: 'AccessToken';
	entityId: string;
	application: ApiOAuthApplication;
	scope: string;
	expires: string;
	created: string;
}

export interface ApiOAuthApplication {
	name: string;
	image?: string;
	website_url?: string;
	clientId?: string;
}
