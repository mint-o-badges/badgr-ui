import {inject, TestBed} from '@angular/core/testing';
import {AppConfigService} from '../../common/app-config.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import {expectRequestAndRespondWith} from '../../common/util/mock-response-util.spec';
import {verifyEntitySetWhenLoaded, verifyManagedEntitySet} from '../../common/model/managed-entity-set.spec';
import {RecipientBadgeCollectionApiService} from './recipient-badge-collection-api.service';
import {RecipientBadgeCollectionManager} from './recipient-badge-collection-manager.service';
import {buildTestRecipientBadgeCollections} from '../models/recipient-badge-collection.model.spec';
import {ApiRecipientBadgeCollection} from '../models/recipient-badge-collection-api.model';
import {RecipientBadgeApiService} from './recipient-badges-api.service';
import {RecipientBadgeManager} from './recipient-badge-manager.service';
import {MessageService} from '../../common/services/message.service';
import {EventsService} from '../../common/services/events.service';
import {SessionService} from '../../common/services/session.service';

xdescribe('RecipientBadgeCollectionManger', () => {
    let httpMock: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [  ],
            providers: [
                AppConfigService,
                MessageService,

                SessionService,
                CommonEntityManager,
                RecipientBadgeCollectionApiService,
                RecipientBadgeCollectionManager,

                EventsService,

                RecipientBadgeApiService,
                RecipientBadgeManager
            ],
            imports: [ ]
        });

        httpMock = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

	beforeEach(inject([ SessionService ], (loginService: SessionService) => {
		loginService.storeToken({ access_token: "MOCKTOKEN" });
	}));

	it('should retrieve all recipient badge collections',
		inject(
			[ RecipientBadgeCollectionManager ],
			(recipientBadgeCollectionManager: RecipientBadgeCollectionManager) => {
				const testData = buildTestRecipientBadgeCollections();

				return Promise.all([
					expectAllCollectionsRequest(httpTestingController, testData.apiCollections),
					verifyEntitySetWhenLoaded(recipientBadgeCollectionManager.recipientBadgeCollectionList, testData.apiCollections)
				]);
			}
		)
	);

	it('should retrieve collections on subscription',
		inject(
			[ RecipientBadgeCollectionManager ],
			(recipientBadgeCollectionManager: RecipientBadgeCollectionManager) => {
				const testData = buildTestRecipientBadgeCollections();

				return Promise.all([
					expectAllCollectionsRequest(httpTestingController, testData.apiCollections),
					recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise.then(() => {
						verifyManagedEntitySet(recipientBadgeCollectionManager.recipientBadgeCollectionList, testData.apiCollections);
					})
				]);
			}
		)
	);

	it('should add a new collections successfully',
		inject(
			[ RecipientBadgeCollectionManager ],
			(recipientBadgeCollectionManager: RecipientBadgeCollectionManager) => {
				const testData = buildTestRecipientBadgeCollections();

				const existingRecipientBadgeCollection = testData.apiCollection1;
				const newRecipientBadgeCollection = testData.apiCollection2;

				return Promise.all([
					expectAllCollectionsRequest(httpTestingController, [ existingRecipientBadgeCollection ]),
					expectCollectionPost(httpTestingController, newRecipientBadgeCollection),
					verifyEntitySetWhenLoaded(recipientBadgeCollectionManager.recipientBadgeCollectionList, [ existingRecipientBadgeCollection ])
						.then(recipientBadgeCollectionsList => recipientBadgeCollectionManager.createRecipientBadgeCollection(newRecipientBadgeCollection))
						.then(() => verifyManagedEntitySet(recipientBadgeCollectionManager.recipientBadgeCollectionList, [ newRecipientBadgeCollection, existingRecipientBadgeCollection ]))
				]);
			}
		)
	);

	// TODO: Tests for modifying and saving recipient badge collection

	it('should delete a collection',
		inject(
			[ RecipientBadgeCollectionManager ],
			(recipientBadgeCollectionManager: RecipientBadgeCollectionManager) => {
				const testData = buildTestRecipientBadgeCollections();

				const startingCollections = [ testData.apiCollection1, testData.apiCollection2 ];
				const toDelete = testData.apiCollection2;
				const endingCollections = [ testData.apiCollection1 ];

				return Promise.all([
					expectAllCollectionsRequest(httpTestingController, startingCollections),
					expectRequestAndRespondWith(
						httpTestingController,
						'DELETE',
						`/v1/earner/collections/${toDelete.slug}`,
						JSON.stringify({}),
						201
					),
					verifyEntitySetWhenLoaded(recipientBadgeCollectionManager.recipientBadgeCollectionList, startingCollections)
						.then(recipientBadgeCollectionsList => recipientBadgeCollectionManager.recipientBadgeCollectionList.entityForApiEntity(toDelete).deleteCollection())
						.then(() => verifyManagedEntitySet(recipientBadgeCollectionManager.recipientBadgeCollectionList, endingCollections))
				]);
			}
		)
	);

});

export function expectCollectionPost(
	httpTestingController: HttpTestingController,
	newCollection: ApiRecipientBadgeCollection
) {
	return expectRequestAndRespondWith(
		httpTestingController,
		'POST',
		`/v1/earner/collections?json_format=plain`,
		JSON.stringify(newCollection),
		201
	);
}

export function expectCollectionPut(
	httpTestingController: HttpTestingController,
	collection: ApiRecipientBadgeCollection
) {
	return expectRequestAndRespondWith(
		httpTestingController,
		'PUT',
		`/v1/earner/collections/${collection.slug}?json_format=plain`,
		JSON.stringify(collection),
		201
	);
}

export function expectAllCollectionsRequest(
    httpTestingController: HttpTestingController,
    collections: ApiRecipientBadgeCollection[]) {
	return expectRequestAndRespondWith(
		httpTestingController,
		'GET',
		`/v1/earner/collections?json_format=plain`,
		JSON.stringify(collections)
	);
}
