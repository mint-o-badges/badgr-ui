import { waitForAsync } from '@angular/core/testing';
import { RecipientBadgeApiService } from './recipient-badges-api.service';

xdescribe('RecipientBadgeApiService', () => {
	let service;

	const loginService: any = {
		// mock properties here
	};

	const http: any = {
		// mock properties here
	};

	const configService: any = {
		// mock properties here
	};

	const messageService: any = {
		// mock properties here
	};

	beforeEach(() => {
		service = new RecipientBadgeApiService(loginService, http, configService, messageService);
	});

	it('should run #listRecipientBadges()', async () => {
		// const result = listRecipientBadges();
	});

	it('should run #removeRecipientBadge()', async () => {
		// const result = removeRecipientBadge(instanceSlug);
	});

	it('should run #addRecipientBadge()', async () => {
		// const result = addRecipientBadge(badgeInfo);
	});

	it('should run #saveInstance()', async () => {
		// const result = saveInstance(apiModel);
	});

	it('should run #getBadgeShareUrlForProvider()', async () => {
		// const result = getBadgeShareUrlForProvider(objectIdUrl, shareServiceType);
	});

	it('should run #getCollectionShareUrlForProvider()', async () => {
		// const result = getCollectionShareUrlForProvider(objectIdUrl, shareServiceType);
	});
});
