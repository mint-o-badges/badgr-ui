import { Injectable } from '@angular/core';
import { Angulartics2 } from 'angulartics2';
import { RecipientBadgeApiService } from '../../recipient/services/recipient-badges-api.service';

@Injectable()
export class SharingService {
	constructor(
		private angulartics: Angulartics2,
		private recipientBadgeApiService: RecipientBadgeApiService,
	) {}

	shareWithProvider(
		$event: Event,
		shareServiceType: ShareServiceType,
		objectType: SharedObjectType,
		includeIdentifier: boolean,
		objectIdUrl: string,
		shareUrl: string,
	) {
		this.reportShare(objectType, objectIdUrl, shareServiceType, shareUrl); // analytics report
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

	private reportShare(
		objectType: SharedObjectType,
		objectIdUrl: string,
		serviceType: ShareServiceType,
		sharedUrl: string,
	) {
		this.angulartics.eventTrack.next({
			action: `${objectType}-share`,
			properties: {
				category: `shares-${serviceType.toLowerCase()}`,
				label: 'Share of ' + objectIdUrl + ' to ' + serviceType,
			},
		});
	}
}

export type SharedObjectType = 'BadgeInstance' | 'BadgeCollection';
export type ShareServiceType = 'Facebook' | 'LinkedIn' | 'Twitter' | 'Pinterest';
export type ShareEndPoint = 'shareArticle' | 'certification';
