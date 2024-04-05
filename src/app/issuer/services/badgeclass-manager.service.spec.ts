import { waitForAsync } from '@angular/core/testing';
import { BadgeClassManager } from './badgeclass-manager.service';

xdescribe('BadgeClassManager', () => {
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

	const commonEntityManager: any = {
		// mock properties here
	};

	const badgeClassApi: any = {
		// mock properties here
	};

	const messageService: any = {
		// mock properties here
	};

	beforeEach(() => {
		service = new BadgeClassManager(
			loginService,
			http,
			configService,
			commonEntityManager,
			badgeClassApi,
			messageService,
		);
	});

	it('should run #removeBadgeClass()', async () => {
		// const result = removeBadgeClass(badge);
	});

	it('should run #createBadgeClass()', async () => {
		// const result = createBadgeClass(issuerSlug, newBadge);
	});

	it('should run #badgeByIssuerUrlAndSlug()', async () => {
		// const result = badgeByIssuerUrlAndSlug(issuerId, badgeSlug);
	});

	it('should run #badgeByIssuerSlugAndSlug()', async () => {
		// const result = badgeByIssuerSlugAndSlug(issuerSlug, badgeSlug);
	});

	it('should run #loadedBadgeByRef()', async () => {
		// const result = loadedBadgeByRef(badgeRef);
	});

	it('should run #loadedBadgeByIssuerIdAndSlug()', async () => {
		// const result = loadedBadgeByIssuerIdAndSlug(issuerId, badgeSlug);
	});

	it('should run #badgeByRef()', async () => {
		// const result = badgeByRef(badgeRef);
	});

	it('should run #badgesByUrls()', async () => {
		// const result = badgesByUrls(badgeUrls);
	});

	it('should run #throwError()', async () => {
		// const result = throwError(message);
	});
});
