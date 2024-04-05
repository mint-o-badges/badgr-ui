import { waitForAsync } from '@angular/core/testing';
import { BadgeClassApiService } from './badgeclass-api.service';

xdescribe('BadgeClassApiService', () => {
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
		service = new BadgeClassApiService(loginService, http, configService, messageService);
	});

	it('should run #getAllUserBadgeClasses()', async () => {
		// const result = getAllUserBadgeClasses();
	});

	it('should run #getBadgesForIssuer()', async () => {
		// const result = getBadgesForIssuer(issuerSlug);
	});

	it('should run #getBadgeForIssuerSlugAndBadgeSlug()', async () => {
		// const result = getBadgeForIssuerSlugAndBadgeSlug(issuerSlug, badgeSlug);
	});

	it('should run #deleteBadgeClass()', async () => {
		// const result = deleteBadgeClass(issuerSlug, badgeSlug);
	});

	it('should run #createBadgeClass()', async () => {
		// const result = createBadgeClass(issuerSlug, badgeClass);
	});

	it('should run #updateBadgeClass()', async () => {
		// const result = updateBadgeClass(issuerSlug, badgeClass);
	});
});
