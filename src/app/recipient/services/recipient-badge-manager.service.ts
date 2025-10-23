import { Injectable, inject } from '@angular/core';
import { RecipientBadgeApiService } from './recipient-badges-api.service';
import { RecipientBadgeInstance } from '../models/recipient-badge.model';
import { ApiRecipientBadgeInstance, RecipientBadgeInstanceCreationInfo } from '../models/recipient-badge-api.model';
import { StandaloneEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { EventsService } from '../../common/services/events.service';

@Injectable({ providedIn: 'root' })
export class RecipientBadgeManager {
	recipientBadgeApiService = inject(RecipientBadgeApiService);
	eventsService = inject(EventsService);
	commonEntityManager = inject(CommonEntityManager);

	recipientBadgeList = new StandaloneEntitySet<RecipientBadgeInstance, ApiRecipientBadgeInstance>(
		(apiModel) => new RecipientBadgeInstance(this.commonEntityManager),
		(apiModel) => String(apiModel.id),
		() => this.recipientBadgeApiService.listRecipientBadges(),
	);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const eventsService = this.eventsService;

		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
		eventsService.recipientBadgesStale.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createRecipientBadge(badgeInfo: RecipientBadgeInstanceCreationInfo): Promise<ApiRecipientBadgeInstance> {
		// Ensure there aren't any null or undefined values in the request, despite not being needed, they cause validation
		// errors in the API.
		const payload: RecipientBadgeInstanceCreationInfo = Object.assign({}, badgeInfo);
		Object.keys(payload).forEach((key) => {
			if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
				delete payload[key];
			}
		});

		return this.recipientBadgeApiService.addRecipientBadge(payload);
	}

	deleteRecipientBadge(badge: RecipientBadgeInstance) {
		return this.recipientBadgeApiService
			.removeRecipientBadge(badge.slug)
			.then(() => this.recipientBadgeList.remove(badge))
			.then((r) => {
				this.commonEntityManager.recipientBadgeCollectionManager.updateIfLoaded();
				return r;
			});
	}

	updateIfLoaded() {
		this.recipientBadgeList.updateIfLoaded();
	}
}
