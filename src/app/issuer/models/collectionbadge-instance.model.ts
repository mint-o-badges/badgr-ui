import {
	ApiCollectionBadgeInstance,
	ApiCollectionBadgeInstanceForBatchCreation,
	ApiCollectionBadgeInstanceForCreation,
	CollectionBadgeInstanceRef,
} from './collectionbadge-instance-api.model';
import { IssuerUrl } from './issuer-api.model';
import { ManagedEntity } from '../../common/model/managed-entity';
import { ApiEntityRef } from '../../common/model/entity-ref';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CollectionBadgeInstanceManager } from '../services/collectionbadge-instance-manager.service';
import { PaginationResults } from '../services/collectionbadge-instance-api.service';

export class CollectionBadgeClassInstances extends StandaloneEntitySet<
	CollectionBadgeInstance,
	ApiCollectionBadgeInstance
> {
	lastPaginationResult: PaginationResults = null;

	constructor(
		public collectionBadgeInstanceManager: CollectionBadgeInstanceManager,
		public issuerSlug: string,
		public collectionBadgeClassSlug: string,
		public recipientQuery?: string,
	) {
		super(
			(apiModel) => new CollectionBadgeInstance(this),
			(apiModel) => apiModel.public_url || 'remove me',
			() => {
				return this.collectionBadgeInstanceManager.collectionBadgeInstanceApiService
					.listCollectionBadgeInstances(issuerSlug, collectionBadgeClassSlug, recipientQuery)
					.then((resultset) => {
						if (resultset.links) {
							this.lastPaginationResult = resultset.links;
						}
						return resultset.instances;
					});
			},
		);
	}

	createBadgeInstance(initialBadgeInstance: ApiCollectionBadgeInstanceForCreation): Promise<CollectionBadgeInstance> {
		return this.collectionBadgeInstanceManager.collectionBadgeInstanceApiService
			.createCollectionBadgeInstance(this.issuerSlug, this.collectionBadgeClassSlug, initialBadgeInstance)
			.then((newApiInstance) => {
				this.addOrUpdate(newApiInstance);
				return this.entityForSlug(newApiInstance.slug);
			});
	}

	// createBadgeInstanceBatched(badgeInstanceBatch: ApiBadgeInstanceForBatchCreation): Promise<BadgeInstance[]> {
	// 	const badgeInstances: BadgeInstance[] = [];
	// 	return this.badgeInstanceManager.badgeInstanceApiService
	// 		.createBadgeInstanceBatched(this.issuerSlug, this.badgeClassSlug, badgeInstanceBatch)
	// 		.then((newApiInstance) => {
	// 			newApiInstance.forEach((apiInstance) => {
	// 				this.addOrUpdate(apiInstance);
	// 				badgeInstances.push(this.entityForSlug(apiInstance.slug));
	// 			});
	// 			return badgeInstances;
	// 		});
	// }

	// loadNextPage() {
	// 	if (this.lastPaginationResult && this.lastPaginationResult.hasNext) {
	// 		return this.loadPage(this.lastPaginationResult.nextUrl);
	// 	}
	// }

	// loadPrevPage() {
	// 	if (this.lastPaginationResult && this.lastPaginationResult.hasPrev) {
	// 		return this.loadPage(this.lastPaginationResult.prevUrl);
	// 	}
	// }

	// private loadPage(url) {
	// 	return this.collectionBadgeInstanceManager.badgeInstanceApiService.getBadgeInstancePage(url).then((resultset) => {
	// 		if (resultset.links) {
	// 			this.lastPaginationResult = resultset.links;
	// 		}
	// 		this.updateSetUsingApiModels(resultset.instances);
	// 	});
	// }
}

/**
 * Managed class for an issued CollectionBadge Instance.
 */
export class CollectionBadgeInstance extends ManagedEntity<ApiCollectionBadgeInstance, CollectionBadgeInstanceRef> {
	constructor(
		public collectionBadgeClassInstances: CollectionBadgeClassInstances,
		initialEntity: ApiCollectionBadgeInstance = null,
	) {
		super(collectionBadgeClassInstances.collectionBadgeInstanceManager.commonManager);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': this.instanceUrl,
			slug: this.apiModel.slug,
		};
	}

	get instanceUrl(): string {
		// return this.apiModel.public_url || this.apiModel.json.id;
		return '';
	}

	get issuerUrl(): IssuerUrl {
		return this.apiModel.issuer;
	}

	get issuerSlug(): string {
		return this.collectionBadgeClassInstances.issuerSlug;
	}

	// get badgeClassUrl(): BadgeClassUrl {
	// 	return this.apiModel.badge_class;
	// }

	get badgeClassSlug(): string {
		return this.collectionBadgeClassInstances.collectionBadgeClassSlug;
	}

	get recipientIdentifier(): string {
		return this.apiModel.recipient_identifier;
	}
	get recipientType(): string {
		return this.apiModel.recipient_type;
	}

	get image(): string {
		return this.apiModel.image;
	}
	// get imagePreview(): string {
	// 	return `${this.apiModel.json.image}?type=png`;
	// }

	// get issuedOn(): Date {
	// 	return new Date(this.apiModel.json.issuedOn);
	// }

	get createdAt(): Date {
		return new Date(this.apiModel.created_at);
	}

	get createdBy(): string {
		return this.apiModel.created_by;
	}

	get isRevoked(): boolean {
		return this.apiModel.revoked;
	}

	get revocationReason(): string {
		return this.apiModel.revocation_reason;
	}

	// revokeCollectionBadgeInstance(revocationReason: string): Promise<CollectionBadgeClassInstances> {
	// 	return this.badgeInstanceManager.badgeInstanceApiService
	// 		.revokeBadgeInstance(this.issuerSlug, this.badgeClassSlug, this.slug, revocationReason)
	// 		.then(() => {
	// 			this.badgeClassInstances.remove(this);
	// 			return this.badgeClassInstances;
	// 		});
	// }
}
