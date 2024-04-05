import { ManagedEntity } from './managed-entity';
import { ApiOAuth2AppAuthorization, OAuth2AppAuthorizationRef } from './oauth-api.model';

export class OAuth2AppAuthorization extends ManagedEntity<ApiOAuth2AppAuthorization, OAuth2AppAuthorizationRef> {
	protected buildApiRef(): OAuth2AppAuthorizationRef {
		return {
			'@id': this.apiModel.entityId,
			slug: this.apiModel.entityId,
		};
	}

	get entityId() {
		return this.apiModel.entityId;
	}

	get scopes() {
		return this.apiModel.scope.split(' ');
	}
	get expiresDate() {
		return new Date(this.apiModel.expires);
	}
	get createdDate() {
		return new Date(this.apiModel.created);
	}

	get name() {
		return this.apiModel.application.name;
	}
	get imageUrl() {
		return this.apiModel.application.image;
	}
	get websiteUrl() {
		return this.apiModel.application.website_url;
	}
	get clientId() {
		return this.apiModel.application.clientId;
	}

	revokeAccess() {
		return this.oAuthManager.oauthApi
			.deleteAuthorization(this.entityId)
			.then(() => this.oAuthManager.authorizedApps.remove(this));
	}
}
