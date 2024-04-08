import { inject, TestBed } from '@angular/core/testing';
import { BadgeClass } from './badgeclass.model';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { ApiBadgeClass } from './badgeclass-api.model';

describe('BadgeClass', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		new BadgeClass(commonManager);
	}));

	it('should correctly alias fields', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const badge = new BadgeClass(commonManager, apiBadgeClass1);

		verifyBadgeClass(badge, apiBadgeClass1);
	}));
});

export function verifyBadgeClass(badgeClass: BadgeClass, apiBadgeClass: ApiBadgeClass) {
	expect(badgeClass.url).toEqual(apiBadgeClass.json.id);
	expect(badgeClass.slug).toEqual(apiBadgeClass.slug);

	expect(badgeClass.badgeUrl).toEqual(apiBadgeClass.json.id);
	expect(badgeClass.issuerUrl).toEqual(apiBadgeClass.issuer);

	expect(badgeClass.name).toEqual(apiBadgeClass.name);
	expect(badgeClass.description).toEqual(apiBadgeClass.description);

	expect(badgeClass.image).toEqual(apiBadgeClass.image);
	expect(badgeClass.createdAt).toEqual(new Date(apiBadgeClass.created_at));
	expect(badgeClass.createdBy).toEqual(apiBadgeClass.created_by);

	expect(badgeClass.recipientCount).toEqual(apiBadgeClass.recipient_count);

	expect(badgeClass.issuerSlug).toEqual(
		apiBadgeClass.issuer.substring(apiBadgeClass.issuer.indexOf('/public/issuers/') + '/public/issuers/'.length),
	);
}

export const apiBadgeClass1 = {
	created_at: '2016-04-25T21:39:05Z',
	id: 209,
	issuer: 'https://api.review.badgr.io/public/issuers/pacific-science-center',
	json: {
		name: 'Team Work',
		image: 'https://api.review.badgr.io/public/badges/team-work/image',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'BadgeClass',
		id: 'https://api.review.badgr.io/public/badges/team-work',
		issuer: 'https://api.review.badgr.io/public/issuers/pacific-science-center',
	},
	name: 'Team Work',
	description: ' ',
	image: 'https://api.review.badgr.io/media/uploads/badges/issuer_badgeclass_42af2266-0275-4ba1-859d-94a33630b063.svg',
	slug: 'team-work',
	recipient_count: 0,
	created_by: 'https://api.review.badgr.io/user/67',
} as ApiBadgeClass;

export const apiBadgeClass2 = {
	created_at: '2016-04-25T17:28:00Z',
	id: 175,
	issuer: 'https://api.review.badgr.io/public/issuers/pacific-science-center',
	json: {
		name: 'DCI Training',
		image: 'https://api.review.badgr.io/public/badges/dci-training/image',
		criteriaUrl: 'https://api.review.badgr.io/public/badges/dci-training/criteria',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'BadgeClass',
		id: 'https://api.review.badgr.io/public/badges/dci-training',
		issuer: 'https://api.review.badgr.io/public/issuers/pacific-science-center',
	},
	name: 'DCI Training',
	description:
		'This badge is awarded to students who have completed the Discovery Corps Interpreter (DCI) training to orient them to the jobs and responsibilities available at this level of the Discovery Corps career ladder\t',
	image: 'https://api.review.badgr.io/media/uploads/badges/issuer_badgeclass_78726271-8286-4f11-b35a-a393a475c39b.svg',
	slug: 'dci-training',
	recipient_count: 0,
	created_by: 'https://api.review.badgr.io/user/67',
} as ApiBadgeClass;

export const apiBadgeClass3 = {
	created_at: '2016-04-19T21:04:42Z',
	id: 150,
	issuer: 'https://api.review.badgr.io/public/issuers/galatic-empire',
	json: {
		name: 'Rebel Extinguisher',
		image: 'https://api.review.badgr.io/public/badges/rebel-extinguisher/image',
		criteriaUrl: 'https://api.review.badgr.io/public/badges/rebel-extinguisher/criteria',
		'@context': 'https://w3id.org/openbadges/v1',
		type: 'BadgeClass',
		id: 'https://api.review.badgr.io/public/badges/rebel-extinguisher',
		issuer: 'https://api.review.badgr.io/public/issuers/galatic-empire',
	},
	name: 'Rebel Extinguisher',
	description: null,
	image: 'https://api.review.badgr.io/media/uploads/badges/issuer_badgeclass_9d69e307-205d-46e4-a3b5-d6cf92c82097.png',
	slug: 'rebel-extinguisher',
	recipient_count: 1,
	created_by: 'https://api.review.badgr.io/user/66',
} as ApiBadgeClass;
