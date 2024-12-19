import { inject, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../common/app-config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { expectRequestAndRespondWith } from '../../common/util/mock-response-util.spec';
import { verifyEntitySetWhenLoaded, verifyManagedEntitySet } from '../../common/model/managed-entity-set.spec';
import { RecipientBadgeApiService } from './recipient-badges-api.service';
import { RecipientBadgeManager } from './recipient-badge-manager.service';
import { ApiRecipientBadgeInstance } from '../models/recipient-badge-api.model';
import { buildTestRecipientBadges } from '../models/recipient-badge.model.spec';
import { RecipientBadgeCollectionManager } from './recipient-badge-collection-manager.service';
import { buildTestRecipientBadgeCollections } from '../models/recipient-badge-collection.model.spec';
import { expectAllCollectionsRequest, expectCollectionPut } from './recipient-badge-collection-manager.service.spec';
import { RecipientBadgeCollectionApiService } from './recipient-badge-collection-api.service';
import { MessageService } from '../../common/services/message.service';
import { EventsService } from '../../common/services/events.service';
import { SessionService } from '../../common/services/session.service';
import { first, skip } from 'rxjs/operators';

xdescribe('RecipientBadgeManger', () => {
	let httpMock: HttpClient;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [],
			providers: [
				AppConfigService,
				MessageService,
				{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } },
				SessionService,
				CommonEntityManager,
				RecipientBadgeApiService,
				RecipientBadgeManager,
				RecipientBadgeCollectionManager,
				RecipientBadgeCollectionApiService,
				EventsService,
			],
			imports: [],
		});

		httpMock = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	beforeEach(inject([SessionService], (loginService: SessionService) => {
		loginService.storeToken({ access_token: 'MOCKTOKEN' });
	}));

	it('should retrieve all recipient badges', inject(
		[RecipientBadgeManager],
		(recipientBadgeManager: RecipientBadgeManager) => {
			const testData = buildTestRecipientBadges();

			return Promise.all([
				expectAllBadgesRequest(httpTestingController, testData.apiBadges),
				verifyEntitySetWhenLoaded(recipientBadgeManager.recipientBadgeList, testData.apiBadges),
			]);
		},
	));

	it('should retrieve recipientBadges on subscription of allRecipientBadges$', inject(
		[RecipientBadgeManager],
		(recipientBadgeManager: RecipientBadgeManager) => {
			const testData = buildTestRecipientBadges();

			return Promise.all([
				expectAllBadgesRequest(httpTestingController, testData.apiBadges),
				recipientBadgeManager.recipientBadgeList.loadedPromise.then(() => {
					verifyManagedEntitySet(recipientBadgeManager.recipientBadgeList, testData.apiBadges);
				}),
			]);
		},
	));

	it('should add a new badge', inject([RecipientBadgeManager], (recipientBadgeManager: RecipientBadgeManager) => {
		const testData = buildTestRecipientBadges();

		const existingRecipientBadge = testData.apiBadge1;
		const newRecipientBadge = testData.apiBadge2;

		return Promise.all([
			expectAllBadgesRequest(httpTestingController, [existingRecipientBadge]),
			expectRequestAndRespondWith(
				httpTestingController,
				'POST',
				`/v1/earner/badges?json_format=plain`,
				JSON.stringify(newRecipientBadge),
				201,
			),
			verifyEntitySetWhenLoaded(recipientBadgeManager.recipientBadgeList, [existingRecipientBadge])
				.then((recipientBadgesList) =>
					recipientBadgeManager.createRecipientBadge({
						assertion: JSON.stringify(newRecipientBadge),
					}),
				)
				.then(() =>
					verifyManagedEntitySet(recipientBadgeManager.recipientBadgeList, [
						newRecipientBadge,
						existingRecipientBadge,
					]),
				),
		]);
	}));

	it('should list associated collections', inject(
		[RecipientBadgeManager, RecipientBadgeCollectionManager],
		(recipientBadgeManager: RecipientBadgeManager, collectionManager: RecipientBadgeCollectionManager) => {
			const testBadges = buildTestRecipientBadges();
			const testCollections = buildTestRecipientBadgeCollections();

			const apiBadge = testBadges.apiBadge1;
			const extraCollection = testCollections.apiCollection1;
			const containingCollection = testCollections.apiCollection2;

			extraCollection.badges = [];
			containingCollection.badges = [
				{
					id: apiBadge.id + '',
					description: '',
				},
			];

			return Promise.all([
				expectAllBadgesRequest(httpTestingController, [apiBadge]),
				expectAllCollectionsRequest(httpTestingController, [extraCollection, containingCollection]),
				verifyEntitySetWhenLoaded(recipientBadgeManager.recipientBadgeList, [apiBadge])
					.then((list) => list.entityForApiEntity(apiBadge))
					.then((badge) => {
						return badge.collections.loadedPromise.then((collections) =>
							expect(collections.entities).toEqual(
								collectionManager.recipientBadgeCollectionList.entitiesForApiEntities([
									containingCollection,
								]),
							),
						);
					}),
			]);
		},
	));

	it('should update associated collections when they are modified', inject(
		[RecipientBadgeManager, RecipientBadgeCollectionManager],
		(recipientBadgeManager: RecipientBadgeManager, collectionManager: RecipientBadgeCollectionManager) => {
			const collectionList = collectionManager.recipientBadgeCollectionList;

			const testBadges = buildTestRecipientBadges();
			const testCollections = buildTestRecipientBadgeCollections();

			const apiBadge = testBadges.apiBadge1;
			const extraCollection = testCollections.apiCollection1;
			const containingCollection = testCollections.apiCollection2;

			extraCollection.badges = [];
			containingCollection.badges = [];

			return Promise.all([
				expectAllBadgesRequest(httpTestingController, [apiBadge]),
				expectAllCollectionsRequest(httpTestingController, [extraCollection, containingCollection]),
				verifyEntitySetWhenLoaded(recipientBadgeManager.recipientBadgeList, [apiBadge])
					.then((list) => list.entityForApiEntity(apiBadge))
					.then((badge) => {
						return badge.collections.loadedPromise.then((collections) => {
							try {
								return badge.collections.changed$
									.pipe(skip(1), first())
									.toPromise()
									.then(() =>
										expect(collections.entities.map((e) => e.url)).toEqual(
											collectionManager.recipientBadgeCollectionList
												.entitiesForApiEntities([containingCollection])
												.map((e) => e.url),
										),
									);
							} finally {
								collectionList.entityForApiEntity(containingCollection).addBadge(badge);
							}
						});
					}),
			]);
		},
	));

	it('should handle adding and removing collections', inject(
		[RecipientBadgeManager, RecipientBadgeCollectionManager],
		(recipientBadgeManager: RecipientBadgeManager, collectionManager: RecipientBadgeCollectionManager) => {
			const collectionList = collectionManager.recipientBadgeCollectionList;

			const testBadges = buildTestRecipientBadges();
			const testCollections = buildTestRecipientBadgeCollections();

			const apiBadge = testBadges.apiBadge1;
			const addCollection = testCollections.apiCollection1;
			const removeCollection = testCollections.apiCollection2;

			addCollection.badges = [];
			removeCollection.badges = [
				{
					id: apiBadge.id + '',
					description: '',
				},
			];

			const addCollectionResponse = Object.assign({}, addCollection, { badges: removeCollection.badges });

			const removeCollectionResponse = Object.assign({}, removeCollection, { badges: [] });

			return Promise.all([
				expectAllBadgesRequest(httpTestingController, [apiBadge]),
				expectAllCollectionsRequest(httpTestingController, [addCollection, removeCollection]),
				verifyEntitySetWhenLoaded(recipientBadgeManager.recipientBadgeList, [apiBadge])
					.then((list) => list.entityForApiEntity(apiBadge))
					.then((badge) => {
						return badge.collections.loadedPromise.then((collections) => {
							collections.add(collectionList.entityForApiEntity(addCollection));
							collections.remove(collectionList.entityForApiEntity(removeCollection));

							return Promise.all([
								expectCollectionPut(httpTestingController, addCollectionResponse),
								expectCollectionPut(httpTestingController, removeCollectionResponse),
								badge.save(),
							]);
						});
					}),
			]);
		},
	));
});

function expectAllBadgesRequest(httpTestingController: HttpTestingController, badges: ApiRecipientBadgeInstance[]) {
	return expectRequestAndRespondWith(
		httpTestingController,
		'GET',
		`/v1/earner/badges?json_format=plain`,
		JSON.stringify(badges),
	);
}
