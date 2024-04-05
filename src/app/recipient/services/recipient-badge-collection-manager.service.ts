import { forwardRef, Inject, Injectable } from '@angular/core';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import {
	ApiRecipientBadgeCollection,
	ApiRecipientBadgeCollectionForCreation,
} from '../models/recipient-badge-collection-api.model';
import { RecipientBadgeCollection } from '../models/recipient-badge-collection.model';
import { RecipientBadgeCollectionApiService } from './recipient-badge-collection-api.service';
import { EventsService } from '../../common/services/events.service';

@Injectable()
export class RecipientBadgeCollectionManager {
	recipientBadgeCollectionList = new StandaloneEntitySet<RecipientBadgeCollection, ApiRecipientBadgeCollection>(
		(apiModel) => new RecipientBadgeCollection(this.commonEntityManager, apiModel),
		(apiModel) => RecipientBadgeCollection.urlForApiModel(apiModel),
		() => this.recipientBadgeCollectionApiService.listRecipientBadgeCollections(),
	);

	constructor(
		public recipientBadgeCollectionApiService: RecipientBadgeCollectionApiService,
		public eventsService: EventsService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager,
	) {
		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createRecipientBadgeCollection(
		collectionIngo: ApiRecipientBadgeCollectionForCreation,
	): Promise<RecipientBadgeCollection> {
		return this.recipientBadgeCollectionApiService
			.addRecipientBadgeCollection(collectionIngo)
			.then((newBadge) => this.recipientBadgeCollectionList.addOrUpdate(newBadge));
	}

	deleteRecipientBadgeCollection(collection: RecipientBadgeCollection) {
		return this.recipientBadgeCollectionApiService
			.removeRecipientBadgeCollection(collection.slug)
			.then(() => this.recipientBadgeCollectionList.remove(collection));
	}

	updateIfLoaded() {
		this.recipientBadgeCollectionList.updateIfLoaded();
	}
}
