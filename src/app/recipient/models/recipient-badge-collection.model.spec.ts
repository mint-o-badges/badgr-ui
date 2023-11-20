import {inject, TestBed} from '@angular/core/testing';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';
import {RecipientBadgeCollection} from './recipient-badge-collection.model';
import {ApiRecipientBadgeCollection} from './recipient-badge-collection-api.model';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AppConfigService} from '../../common/app-config.service';
import {RecipientBadgeApiService} from '../services/recipient-badges-api.service';
import {RecipientBadgeManager} from '../services/recipient-badge-manager.service';
import {MessageService} from '../../common/services/message.service';
import {EventsService} from '../../common/services/events.service';
import {SessionService} from '../../common/services/session.service';

describe('RecipientBadgeCollection', () => {
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
                RecipientBadgeApiService,
                RecipientBadgeManager,
                EventsService
            ],
            imports: [ ]
        });

        httpMock = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

	it(
		'should be constructable',
		inject(
			[ CommonEntityManager ],
			(commonManager: CommonEntityManager) => {
				new RecipientBadgeCollection(commonManager);
			}
		)
	);

	it(
		'should correctly alias fields',
		inject(
			[ CommonEntityManager ],
			(commonManager: CommonEntityManager) => {
				const { apiCollection1, apiCollection2, apiCollection3 } = buildTestRecipientBadgeCollections();

				[ apiCollection1, apiCollection2, apiCollection3 ].forEach(apiCollection => {
					const badge = new RecipientBadgeCollection(commonManager, apiCollection);
					verifyRecipientBadgeCollection(badge, apiCollection);
				});
			}
		)
	);
});

export function verifyRecipientBadgeCollection(
	collection: RecipientBadgeCollection,
	apiCollection: ApiRecipientBadgeCollection
) {
	expect(collection.name).toEqual(apiCollection.name);
	expect(collection.description).toEqual(apiCollection.description);
	expect(collection.published).toEqual(apiCollection.published);
	expect(collection.shareHash).toEqual(apiCollection.share_hash);
	expect(collection.shareUrl).toEqual(apiCollection.share_url);

	expect(collection.badgeEntries.entities.map(e => e.badgeSlug)).toEqual(apiCollection.badges.map(e => String(e.id)));
	expect(collection.badgeEntries.entities.map(e => e.description)).toEqual(apiCollection.badges.map(e => e.description));
}


export function buildTestRecipientBadgeCollections(): {
	apiCollection1: ApiRecipientBadgeCollection;
	apiCollection2: ApiRecipientBadgeCollection;
	apiCollection3: ApiRecipientBadgeCollection;
	apiCollections: ApiRecipientBadgeCollection[]
} {
	const [ apiCollection1, apiCollection2, apiCollection3 ]: ApiRecipientBadgeCollection[] = [
		{
			"name": "Some Badges",
			"slug": "some-badges",
			"description": "Got together having very success.",
			"share_hash": "d4e6da2f6528a632ee534202a4576bcd",
			"share_url": "http://localhost:8000/earner/collections/3/d4e6da2f6528a632ee534202a4576bcd",
			"badges": [
				{
					"id": 2,
					"description": ""
				},
				{
					"id": 27,
					"description": ""
				},
				{
					"id": 29,
					"description": ""
				},
				{
					"id": 23,
					"description": ""
				},
				{
					"id": 24,
					"description": ""
				},
				{
					"id": 20,
					"description": ""
				},
				{
					"id": 26,
					"description": ""
				},
				{
					"id": 25,
					"description": ""
				},
				{
					"id": 5,
					"description": ""
				},
				{
					"id": 28,
					"description": ""
				},
				{
					"id": 22,
					"description": ""
				},
				{
					"id": 31,
					"description": ""
				},
				{
					"id": 21,
					"description": ""
				},
				{
					"id": 30,
					"description": ""
				}
			],
			"published": true
		},
		{
			"name": "Small Many",
			"slug": "small-many",
			"description": "So few",
			"share_hash": "8d75e742d85888077143df9c3c0f1190",
			"share_url": "http://localhost:8000/earner/collections/4/8d75e742d85888077143df9c3c0f1190",
			"badges": [
				{
					"id": 23,
					"description": ""
				},
				{
					"id": 29,
					"description": ""
				},
				{
					"id": 32,
					"description": ""
				}
			],
			"published": true
		},
		{
			"name": "Empty Collection",
			"slug": "empty-collection",
			"description": "Nothingness is everywhere in this collection",
			"share_hash": "",
			"share_url": "",
			"badges": [],
			"published": false
		}
	];

	return {
		apiCollection1,
		apiCollection2,
		apiCollection3,
		apiCollections: [ apiCollection1, apiCollection2, apiCollection3 ]
	};
}
