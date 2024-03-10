import { forwardRef, Inject, Injectable } from '@angular/core';
import { CollectionBadgeClassInstances, CollectionBadgeInstance } from '../models/collectionbadge-instance.model';
import { CollectionBadgeInstanceApiService } from './collectionbadge-instance-api.service';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { ApiCollectionBadgeInstanceForCreation } from '../models/collectionbadge-instance-api.model';

@Injectable()
export class CollectionBadgeInstanceManager {
	private instancesByCollectionBadgeClass: { [collectionBadgeClassSlug: string]: CollectionBadgeClassInstances } = {};

	constructor(
		public collectionBadgeInstanceApiService: CollectionBadgeInstanceApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonManager: CommonEntityManager,
	) {}

	instancesForCollectionBadgeClass(
		issuerSlug: string,
		collectionBadgeClassSlug: string,
	): Promise<CollectionBadgeClassInstances> {
		if (collectionBadgeClassSlug in this.instancesByCollectionBadgeClass) {
			return this.instancesByCollectionBadgeClass[collectionBadgeClassSlug].loadedPromise;
		} else {
			const instanceList = (this.instancesByCollectionBadgeClass[collectionBadgeClassSlug] =
				new CollectionBadgeClassInstances(this, issuerSlug, collectionBadgeClassSlug));
			return instanceList.loadedPromise;
		}
	}

	// createBadgeInstanceBatched(
	// 	issuerSlug: string,
	// 	collectionBadgeClassSlug: string,
	// 	batchCreationInstance: ApiBadgeInstanceForBatchCreation
	// ): Promise<CollectionBadgeInstance[]> {

	// 	return this
	// 		.instancesForCollectionBadgeClass(issuerSlug, collectionBadgeClassSlug)
	// 		.then(instances => instances.createCollectionBadgeInstanceBatched(batchCreationInstance));
	// }

	createBadgeInstance(
		issuerSlug: string,
		collectionBadgeClassSlug: string,
		initialCollectionBadgeInstance: ApiCollectionBadgeInstanceForCreation,
	): Promise<CollectionBadgeInstance> {
		return this.instancesForCollectionBadgeClass(issuerSlug, collectionBadgeClassSlug).then((instances) =>
			instances.createBadgeInstance(initialCollectionBadgeInstance),
		);
	}
}
