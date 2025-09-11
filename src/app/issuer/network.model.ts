import { ManagedEntity } from '~/common/model/managed-entity';
import { ApiIssuer, ApiNetwork, IssuerRef, IssuerUrl } from './models/issuer-api.model';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { ApiEntityRef } from '~/common/model/entity-ref';
import { IssuerStaffMember } from './models/issuer.model';
import { EmbeddedEntitySet } from '~/common/model/managed-entity-set';

export class Network extends ManagedEntity<ApiNetwork, IssuerRef> {
	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiNetwork = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': this.networkUrl,
			slug: this.apiModel.slug,
		};
	}

	get networkUrl(): IssuerUrl {
		return this.apiModel.json.id;
	}

	get createdAt(): Date {
		return new Date(this.apiModel.created_at);
	}

	get name(): string {
		return this.apiModel.json.name;
	}

	get description(): string {
		return this.apiModel.json.description;
	}

	get slug(): string {
		return this.apiModel.slug;
	}

	get image(): string | undefined {
		return this.apiModel.json.image;
	}

	get partnerIssuers(): ApiIssuer[] {
		return this.apiModel.partner_issuers || [];
	}

	get isNetwork(): boolean {
		return true;
	}

	get partnerCount(): number {
		return this.partnerIssuers.length;
	}

	// get currentUserStaffMember(): IssuerStaffMember {
	// 		if (this.profileManager.userProfile && this.profileManager.userProfile.emails.entities) {
	// 			const emails = this.profileManager.userProfile.emails.entities;

	// 			return (
	// 				this.staff.entities.find(
	// 					(staffMember) => !!emails.find((profileEmail) => profileEmail.email === staffMember.email),
	// 				) || null
	// 			);
	// 		} else {
	// 			return null;
	// 		}
	// 	}
}
