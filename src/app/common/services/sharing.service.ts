import { Injectable, inject } from '@angular/core';
import { RecipientBadgeApiService } from '../../recipient/services/recipient-badges-api.service';

@Injectable({ providedIn: 'root' })
export class SharingService {
	private recipientBadgeApiService = inject(RecipientBadgeApiService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	shareWithProvider(
		$event: Event,
		shareServiceType: ShareServiceType,
		objectType: SharedObjectType,
		includeIdentifier: boolean,
		objectIdUrl: string,
		shareUrl: string,
	) {
		const providerFeatures = {
			Facebook: 'width=550,height=274',
			LinkedIn: 'width=550,height=448',
			Twitter: 'width=550,height=274',
		};
		let promise;
		if (objectType === 'BadgeInstance') {
			promise = this.recipientBadgeApiService.getBadgeShareUrlForProvider(
				objectIdUrl,
				shareServiceType,
				includeIdentifier,
			);
		} else if (objectType === 'BadgeCollection') {
			promise = this.recipientBadgeApiService.getCollectionShareUrlForProvider(objectIdUrl, shareServiceType);
		}

		// open window with share url retrieved from server
		const newTab = window.open('', '_blank', providerFeatures[shareServiceType]);
		promise.then((url) => {
			newTab.location.href = url;
		});
	}
}

export type SharedObjectType = 'BadgeInstance' | 'BadgeCollection';
export type ShareServiceType = 'Facebook' | 'LinkedIn' | 'Twitter' | 'Pinterest';
export type ShareEndPoint = 'shareArticle' | 'certification';
