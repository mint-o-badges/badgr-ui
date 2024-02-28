import {forwardRef, Inject, Injectable} from '@angular/core';
import {StandaloneEntitySet} from '../../common/model/managed-entity-set';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import { ApiCollectionBadge } from '../models/collectionbadge-api.model';
import { CollectionBadge } from '../models/collectionbadge.model';
import { CollectionBadgeApiService } from './collectionbadge-api.service';
import {EventsService} from '../../common/services/events.service';
import { Observable } from 'rxjs';
import {first, map} from 'rxjs/operators';

@Injectable()
export class CollectionBadgeManager {
	collectionBadgeList = new StandaloneEntitySet<CollectionBadge, ApiCollectionBadge>(
		apiModel => new CollectionBadge(this.commonEntityManager),
		apiModel => apiModel.slug,
		() => this.collectionBadgeApiService.listCollectionBadges()
	);

	get allCollectionBadges$(): Observable<CollectionBadge[]> {
		return this.collectionBadgeList.loaded$.pipe(map((l) => l.entities));
	}

	constructor(
		public collectionBadgeApiService: CollectionBadgeApiService,
		public eventsService: EventsService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) {
		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createCollectionBadge(
		collectionBadgeIngo: ApiCollectionBadge
	): Promise<CollectionBadge> {
		return this.collectionBadgeApiService
			.addCollectionBadge(collectionBadgeIngo)
			.then(newBadge => this.collectionBadgeList.addOrUpdate(newBadge))
			;
	}

	collectionbadgeByName(name: string): Promise<CollectionBadge> {
		return this.allCollectionBadges$
			.pipe(first())
			.toPromise()
			.then(
				(badges) =>
				
					badges.find((b) => b.apiModel.name === name) ||
					this.throwError(`No badge with name '${name}' found`)
			);
	}

	deleteCollectionBadge(collectionBadge: CollectionBadge) {
		return this.collectionBadgeApiService
			.removeCollectionBadge(collectionBadge.slug)
			.then(() => this.collectionBadgeList.remove(collectionBadge))
			;
	}

	updateIfLoaded() {
		this.collectionBadgeList.updateIfLoaded();
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}
