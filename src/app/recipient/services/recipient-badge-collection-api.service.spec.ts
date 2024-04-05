import { waitForAsync } from '@angular/core/testing';
import { RecipientBadgeCollectionApiService } from './recipient-badge-collection-api.service';

xdescribe('RecipientBadgeCollectionApiService', () => {
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
		service = new RecipientBadgeCollectionApiService(loginService, http, configService, messageService);
	});

	it('should run #listRecipientBadgeCollections()', async () => {
		// const result = listRecipientBadgeCollections();
	});

	it('should run #removeRecipientBadgeCollection()', async () => {
		// const result = removeRecipientBadgeCollection(collectionSlug);
	});

	it('should run #addRecipientBadgeCollection()', async () => {
		// const result = addRecipientBadgeCollection(badgeInfo);
	});

	it('should run #saveRecipientBadgeCollection()', async () => {
		// const result = saveRecipientBadgeCollection(apiModel);
	});
});
