import { inject, TestBed } from '@angular/core/testing';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { RecipientBadgeInstance } from './recipient-badge.model';
import { ApiRecipientBadgeInstance } from './recipient-badge-api.model';

describe('RecipientBadge', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	xit('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const RBI = new RecipientBadgeInstance(commonManager);
	}));

	it('should correctly alias fields', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { apiBadge1, apiBadge2, apiBadge3 } = buildTestRecipientBadges();

		[apiBadge1, apiBadge2, apiBadge3].forEach((apiBadge) => {
			const badge = new RecipientBadgeInstance(commonManager, apiBadge);
			verifyRecipientBadge(badge, apiBadge);
		});
	}));
});

export function verifyRecipientBadge(badge: RecipientBadgeInstance, apiBadge: ApiRecipientBadgeInstance) {
	expect(badge.url).toEqual(String(apiBadge.id));
	expect(badge.slug).toEqual(String(apiBadge.id));

	expect(badge.type).toEqual(apiBadge.json.type);
	expect(badge.recipientEmail).toEqual(apiBadge.recipient_identifier);
	expect(badge.badgeClass).toEqual(apiBadge.json.badge);
	expect(badge.issueDate).toEqual(new Date(apiBadge.json.issuedOn));
	expect(badge.image).toEqual(apiBadge.image);
}

export function buildTestRecipientBadges() {
	const apiBadge1: ApiRecipientBadgeInstance = {
		id: 2,
		alignment: [],
		narrative: '',
		evidence_items: [],
		json: {
			id: 'http://localhost:8000/public/assertions/be6aa326-603b-4725-9c54-e1fde38a7b89',
			type: 'Assertion',
			uid: 'be6aa326-603b-4725-9c54-e1fde38a7b89',
			recipient: { type: 'email', recipient: 'yona@concentricsky.com' },
			badge: {
				id: 'http://localhost:8000/public/badges/issuer2-is-awesome',
				type: 'BadgeClass',
				name: 'Issuer2 Is Awesome',
				description: 'Much Good',
				image: 'http://localhost:8000/public/badges/issuer2-is-awesome/image',
				criteria: 'http://localhost:8000/public/badges/issuer2-is-awesome/criteria',
				criteria_url: 'http://localhost:8000/public/badges/issuer2-is-awesome/criteria',
				criteria_text: 'Some Criteria',
				tags: ['qwerty', 'boberty', 'BanannaFanna'],
				alignment: [],
				issuer: {
					id: 'http://localhost:8000/public/issuers/issuer-2',
					type: 'Issuer',
					name: 'Issuer 2',
					url: 'http://arstechnica.com',
					description: 'Testing issuer for https://jira.concentricsky.com/browse/BS-1163',
					email: 'yona-badgr-issuer-2@mailinator.com',
				},
			},
			issuedOn: '2016-09-22T17:00:33.645506',
			image: 'http://localhost:8000/media/uploads/badges/local_badgeinstance_e44d1289-6365-453a-89b1-38c2bd6cbec4.png',
		},
		image: 'http://localhost:8000/media/uploads/badges/local_badgeinstance_e44d1289-6365-453a-89b1-38c2bd6cbec4.png',
		imagePreview: {
			type: 'image',
			id: 'http://localhost:8000/v1/earner/badges/37f14cf1-7473-4501-a2d1-7849b4fc0b5d/image?type=png',
		},
		recipient_identifier: 'yona@concentricsky.com',
		acceptance: 'Accepted',
	};
	const apiBadge2: ApiRecipientBadgeInstance = {
		id: 5,
		alignment: [],
		narrative: '',
		evidence_items: [],
		json: {
			id: 'http://localhost:8000/public/assertions/96efe8d4-253f-49b4-aab7-30109101e2b8',
			type: 'Assertion',
			uid: '96efe8d4-253f-49b4-aab7-30109101e2b8',
			recipient: { type: 'email', recipient: 'yona@concentricsky.com' },
			badge: {
				id: 'http://localhost:8000/public/badges/science-ribbon',
				type: 'BadgeClass',
				name: 'Science Ribbon',
				description: 'Science all the things',
				image: 'http://localhost:8000/public/badges/science-ribbon/image',
				criteria: 'http://localhost:8000/public/badges/science-ribbon/criteria',
				criteria_url: 'http://localhost:8000/public/badges/science-ribbon/criteria',
				criteria_text: 'Some Criteria',
				tags: ['qwerty', 'boberty', 'BanannaFanna'],
				alignment: [],
				issuer: {
					id: 'http://localhost:8000/public/issuers/big-image-issuer',
					type: 'Issuer',
					name: 'Big Image Issuer',
					url: 'http://arstechnica.com',
					description: 'Test Issuer for https://jira.concentricsky.com/browse/BS-1162',
					image: 'http://localhost:8000/public/issuers/big-image-issuer/image',
					email: 'yona-badgr-issuer1@mailinator.com',
				},
			},
			issuedOn: '2016-09-22T19:06:09.264757',
			image: 'http://localhost:8000/media/uploads/badges/local_badgeinstance_5ca42b9c-0f15-453b-943a-377984a93663.png',
		},
		image: 'http://localhost:8000/public/issuers/big-image-issuer/image',
		imagePreview: {
			type: 'image',
			id: 'http://localhost:8000/v1/earner/badges/4dacd00e-2d49-4dab-aae4-f77b9fb83fd1/image?type=png',
		},
		issuerImagePreview: {
			type: 'image',
			id: 'http://localhost:8000/v1/earner/issuer/big-image-issuer/image?type=png',
		},
		recipient_identifier: 'yona@concentricsky.com',
		acceptance: 'Accepted',
	};
	const apiBadge3: ApiRecipientBadgeInstance = {
		id: 19,
		alignment: [],
		narrative: '',
		evidence_items: [],
		json: {
			id: 'http://localhost:8000/public/assertions/8e7b6a96-1e4b-43e5-abf6-b30b71d29b6e',
			type: 'Assertion',
			uid: '8e7b6a96-1e4b-43e5-abf6-b30b71d29b6e',
			recipient: { type: 'email', recipient: 'yona@concentricsky.com' },
			badge: {
				id: 'http://localhost:8000/public/badges/foo-badge',
				type: 'BadgeClass',
				name: 'Foo Badge',
				description: 'A new badge, yo',
				image: 'http://localhost:8000/public/badges/foo-badge/image',
				criteria: 'http://nowhere.com',
				criteria_url: 'http://nowhere.com',
				criteria_text: 'Some Criteria',
				tags: ['qwerty', 'boberty', 'BanannaFanna'],
				alignment: [],
				issuer: {
					id: 'http://localhost:8000/public/issuers/big-image-issuer',
					type: 'Issuer',
					name: 'Big Image Issuer',
					url: 'http://arstechnica.com',
					description: 'Test Issuer for https://jira.concentricsky.com/browse/BS-1162',
					image: 'http://localhost:8000/public/issuers/big-image-issuer/image',
					email: 'yona-badgr-issuer1@mailinator.com',
				},
			},
			issuedOn: '2016-09-22T15:56:41.838280',
			image: 'http://localhost:8000/media/uploads/badges/local_badgeinstance_7c1973cd-c220-4c4b-8fa2-5ac798ebb7b4.png',
			evidence: 'http://nowhere.com',
		},
		image: 'http://localhost:8000/media/uploads/badges/local_badgeinstance_7c1973cd-c220-4c4b-8fa2-5ac798ebb7b4.png',
		imagePreview: {
			type: 'image',
			id: 'http://localhost:8000/v1/earner/badges/56e73559-2205-40e8-b3e2-be24adf9a1f5/image?type=png',
		},
		issuerImagePreview: {
			type: 'image',
			id: 'http://localhost:8000/v1/earner/issuer/big-image-issuer/image?type=png',
		},
		recipient_identifier: 'yona@concentricsky.com',
		acceptance: 'Accepted',
	};

	return {
		apiBadge1,
		apiBadge2,
		apiBadge3,
		apiBadges: [apiBadge1, apiBadge2, apiBadge3],
	};
}
