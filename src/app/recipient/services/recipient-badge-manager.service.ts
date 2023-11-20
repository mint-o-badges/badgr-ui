import {forwardRef, Inject, Injectable} from '@angular/core';
import {RecipientBadgeApiService} from './recipient-badges-api.service';
import {RecipientBadgeInstance} from '../models/recipient-badge.model';
import {ApiRecipientBadgeInstance, RecipientBadgeInstanceCreationInfo} from '../models/recipient-badge-api.model';
import {StandaloneEntitySet} from '../../common/model/managed-entity-set';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import {EventsService} from '../../common/services/events.service';

// TODO: What is this? It causes problems...
//const test = [CommonEntityManager];

@Injectable()
export class RecipientBadgeManager {
	recipientBadgeList = new StandaloneEntitySet<RecipientBadgeInstance, ApiRecipientBadgeInstance>(
		apiModel => new RecipientBadgeInstance(this.commonEntityManager),
		apiModel => String(apiModel.id),
		() => this.recipientBadgeApiService.listRecipientBadges()
	);

	constructor(
		public recipientBadgeApiService: RecipientBadgeApiService,
		public eventsService: EventsService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) {
		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
		eventsService.recipientBadgesStale.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createRecipientBadge(
		badgeInfo: RecipientBadgeInstanceCreationInfo
	): Promise<RecipientBadgeInstance> {
		// Ensure there aren't any null or undefined values in the request, despite not being needed, they cause validation
		// errors in the API.
		const payload: RecipientBadgeInstanceCreationInfo = Object.assign({}, badgeInfo);
		Object.keys(payload).forEach(key => {
			if (payload[key] === null || payload[key] === undefined || payload[key] === "") {
				delete payload[key];
			}
		});


		return this.recipientBadgeApiService
			.addRecipientBadge(payload)
			.then(newBadge => this.recipientBadgeList.addOrUpdate(newBadge))
			;
	}

	deleteRecipientBadge(badge: RecipientBadgeInstance) {
		return this.recipientBadgeApiService
			.removeRecipientBadge(badge.slug)
			.then(() => this.recipientBadgeList.remove(badge))
			.then(r => {
				this.commonEntityManager.recipientBadgeCollectionManager.updateIfLoaded();
				return r;
			});
	}

	updateIfLoaded() {
		this.recipientBadgeList.updateIfLoaded();
	}
}
