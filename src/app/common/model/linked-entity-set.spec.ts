import { inject, TestBed } from '@angular/core/testing';
import { BidirectionallyLinkedEntitySet, ListBackedLinkedEntitySet } from './linked-entity-set';
import { ApiTestEntity, buildTestEntities, TestApiEntities, TestEntity, TestEntityRef } from './managed-entity.spec';
import { ManagedEntitySet, StandaloneEntitySet } from './managed-entity-set';
import { ManagedEntity } from './managed-entity';
import { AnyRefType, ApiEntityRef, EntityRef } from './entity-ref';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { first } from 'rxjs/operators';

describe('ListBackedLinkedEntitySet', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should correctly attach to a model', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const testEntities = buildTestEntities();

		return buildTestEntityList(commonManager, testEntities).then((allEntities) => {
			const { testApiEntity1, testApiEntity2 } = testEntities;

			const owner = allEntities.entityForApiEntity(testApiEntity1);
			const urls: TestEntityRef[] = [EntityRef.refFrom(testApiEntity2.id)];
			const list = new ListBackedLinkedEntitySet<TestEntity, TestEntity, TestEntityRef>(
				owner,
				() => urls,
				(url) => allEntities.entityForUrl(url),
			);

			return list.loaded$
				.pipe(first())
				.toPromise()
				.then(() => {
					expect(list.entities.length).toBe(1);
					expect(urls).toEqual([EntityRef.refFrom(testApiEntity2.id)]);
				});
		});
	}));

	it('should correctly check presence of mixed id strings and refs', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const testEntities = buildTestEntities();

			return buildTestEntityList(commonManager, testEntities).then((allEntities) => {
				const { testApiEntity1, testApiEntity2, testApiEntity3 } = testEntities;

				const owner = allEntities.entityForApiEntity(testApiEntity1);
				const urls: TestEntityRef[] = [
					EntityRef.refFrom(testApiEntity2.id),
					EntityRef.refFrom(testApiEntity3.id),
				];
				const list = new ListBackedLinkedEntitySet<TestEntity, TestEntity, TestEntityRef>(
					owner,
					() => urls,
					(url) => allEntities.entityForUrl(url),
				);

				return list.loaded$
					.pipe(first())
					.toPromise()
					.then(() => {
						expect(list.entities.length).toBe(2);

						expect(list.has(allEntities.entityForApiEntity(testApiEntity2))).toBe(true);
						expect(list.has(allEntities.entityForApiEntity(testApiEntity3))).toBe(true);
					});
			});
		},
	));

	it('should correctly add and remove elements', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const testEntities = buildTestEntities();

			return buildTestEntityList(commonManager, testEntities).then((allEntities) => {
				const { testApiEntity1, testApiEntity2, testApiEntity3 } = testEntities;

				const owner = allEntities.entityForApiEntity(testApiEntity1);
				const urls: TestEntityRef[] = [EntityRef.refFrom(testApiEntity2.id)];

				const list = new ListBackedLinkedEntitySet<TestEntity, TestEntity, TestEntityRef>(
					owner,
					() => urls,
					(url) => allEntities.entityForUrl(url),
				);

				expect(list.entities.length).toBe(0);
				owner.applyApiModel(testApiEntity1);

				return list.loaded$
					.pipe(first())
					.toPromise()
					.then(() => {
						verifySet(list.entities, allEntities.entitiesForApiEntities([testApiEntity2]));

						list.add(allEntities.entityForApiEntity(testApiEntity3));

						verifySet(list.entities, allEntities.entitiesForApiEntities([testApiEntity2, testApiEntity3]));
						verifyRefSet(urls, [testApiEntity2.id, testApiEntity3.id]);

						list.remove(allEntities.entityForApiEntity(testApiEntity2));

						verifySet(list.entities, allEntities.entitiesForApiEntities([testApiEntity3]));
						verifyRefSet(urls, [testApiEntity3.id]);
					});
			});
		},
	));

	it('should correctly replace list contents', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const testEntities = buildTestEntities();

		return buildTestEntityList(commonManager, testEntities).then((allEntities) => {
			const { testApiEntity1, testApiEntity2, testApiEntity3, testApiEntity4 } = testEntities;

			const owner = allEntities.entityForApiEntity(testApiEntity1);
			const urls: TestEntityRef[] = [EntityRef.refFrom(testApiEntity2.id)];

			const list = new ListBackedLinkedEntitySet<TestEntity, TestEntity, TestEntityRef>(
				owner,
				() => urls,
				(url) => allEntities.entityForUrl(url),
			);

			expect(list.entities.length).toBe(0);
			owner.applyApiModel(testApiEntity1);

			return list.loaded$
				.pipe(first())
				.toPromise()
				.then(() => {
					expect(list.entities.length).toBe(1);

					function testArray(array: ApiTestEntity[]) {
						const newEntities = allEntities.entitiesForApiEntities(array);
						list.setTo(newEntities);
						verifySet(list.entities, newEntities);
						verifyRefSet(
							urls,
							array.map((e) => e.id),
						);
					}

					// Test adding many
					testArray([testApiEntity1, testApiEntity2, testApiEntity3, testApiEntity4]);
					// Test removing
					testArray([testApiEntity1, testApiEntity4]);
					// Test removing and adding
					testArray([testApiEntity2, testApiEntity3, testApiEntity4]);
					// Test setting to empty
					testArray([]);
				});
		});
	}));
});

describe('BidirectionallyLinkedEntitySet', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should correctly handle adding and removing', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const testEntities = buildTestEntities();

			return buildBilinkedEntityList(commonManager, testEntities).then((allEntities) => {
				const { testApiEntity1, testApiEntity2, testApiEntity3, testApiEntity4 } = testEntities;

				const entity1 = allEntities.entityForUrl(testApiEntity1.id);
				const entity2 = allEntities.entityForUrl(testApiEntity2.id);
				const entity3 = allEntities.entityForUrl(testApiEntity3.id);
				const entity4 = allEntities.entityForUrl(testApiEntity4.id);

				entity1.applyApiModel(
					Object.assign({}, testApiEntity1, {
						friends: [EntityRef.refFrom(testApiEntity2.id)],
					}),
				);
				entity2.applyApiModel(
					Object.assign({}, testApiEntity2, {
						friends: [EntityRef.refFrom(testApiEntity1.id)],
					}),
				);

				return Promise.all([
					entity1.friends.loaded$.pipe(first()).toPromise(),
					entity2.friends.loaded$.pipe(first()).toPromise(),
				]).then(() => {
					verifySet(entity1.friends.entities, allEntities.entitiesForUrls([testApiEntity2.id]));
					verifySet(entity2.friends.entities, allEntities.entitiesForUrls([testApiEntity1.id]));

					entity1.friends.remove(entity2);
					verifySet(entity1.friends.entities, allEntities.entitiesForUrls([]));
					verifySet(entity2.friends.entities, allEntities.entitiesForUrls([]));

					entity1.friends.add(entity3);
					verifySet(entity1.friends.entities, allEntities.entitiesForUrls([testApiEntity3.id]));
					verifySet(entity3.friends.entities, allEntities.entitiesForUrls([testApiEntity1.id]));

					entity1.friends.add(entity2);
					verifySet(
						entity1.friends.entities,
						allEntities.entitiesForUrls([testApiEntity2.id, testApiEntity3.id]),
					);
					verifySet(entity2.friends.entities, allEntities.entitiesForUrls([testApiEntity1.id]));
					verifySet(entity3.friends.entities, allEntities.entitiesForUrls([testApiEntity1.id]));
				});
			});
		},
	));

	it('should update bidirectional lists on model update', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const testEntities = buildTestEntities();

			return buildBilinkedEntityList(commonManager, testEntities).then((allEntities) => {
				const { testApiEntity1, testApiEntity2, testApiEntity3, testApiEntity4 } = testEntities;

				const entity1 = allEntities.entityForUrl(testApiEntity1.id);
				const entity2 = allEntities.entityForUrl(testApiEntity2.id);
				const entity3 = allEntities.entityForUrl(testApiEntity3.id);
				const entity4 = allEntities.entityForUrl(testApiEntity4.id);

				function testNewArray(newFriends: TestEntityRef[]) {
					entity1.applyApiModel(
						Object.assign({}, testApiEntity1, {
							friends: newFriends,
						}),
					);

					return Promise.all([
						entity1.friends.loaded$.pipe(first()).toPromise(),
						entity2.friends.loaded$.pipe(first()).toPromise(),
					]).then(() => {
						verifySet(entity1.friends.entities, allEntities.entitiesForUrls(newFriends));

						allEntities
							.entitiesForUrls(newFriends)
							.forEach((e) =>
								verifySet(entity2.friends.entities, allEntities.entitiesForUrls([testApiEntity1.id])),
							);
					});
				}

				return testNewArray([EntityRef.refFrom(testApiEntity2.id), EntityRef.refFrom(testApiEntity3.id)])
					.then(() => testNewArray([EntityRef.refFrom(testApiEntity2.id)]))
					.then(() => testNewArray([]));
			});
		},
	));
});

function buildTestEntityList(
	commonManager: CommonEntityManager,
	testEntities: TestApiEntities,
): Promise<ManagedEntitySet<TestEntity, ApiTestEntity>> {
	const list = new StandaloneEntitySet<TestEntity, ApiTestEntity>(
		(api) => new TestEntity(commonManager, api),
		(api) => api.id,
		() =>
			Promise.resolve([
				testEntities.testApiEntity1,
				testEntities.testApiEntity2,
				testEntities.testApiEntity3,
				testEntities.testApiEntity4,
			]),
	);

	return list.updateList();
}

function buildBilinkedEntityList(
	commonManager: CommonEntityManager,
	testEntities: TestApiEntities,
): Promise<ManagedEntitySet<BilinkedTestEntity, ApiBilinkedTestEntity>> {
	const list = new StandaloneEntitySet<BilinkedTestEntity, ApiBilinkedTestEntity>(
		(api) => new BilinkedTestEntity(commonManager, api, list),
		(api) => api.id,
		() =>
			Promise.resolve([
				testEntities.testApiEntity1,
				testEntities.testApiEntity2,
				testEntities.testApiEntity3,
				testEntities.testApiEntity4,
			] as ApiBilinkedTestEntity[]),
	);

	return list.updateList();
}

function verifySet<T>(actual: ArrayLike<T>, expected: ArrayLike<T>) {
	expect(actual.length).toBe(expected.length);
	for (let i = 0; i < expected.length; i++) {
		expect(Array.prototype.indexOf.apply(actual, [expected[i]])).toBeGreaterThan(-1);
	}
}

function verifyRefSet(actual: ArrayLike<AnyRefType>, expected: ArrayLike<AnyRefType>) {
	expect(actual.length).toBe(expected.length);
	for (let i = 0; i < expected.length; i++) {
		expect(
			Array.prototype.findIndex.apply(actual, [
				(r: AnyRefType) => EntityRef.urlForRef(r) === EntityRef.urlForRef(expected[i]),
			]),
		).toBeGreaterThan(-1);
	}
}

export interface ApiBilinkedTestEntity extends ApiTestEntity {
	friends: TestEntityRef[];
}

export class BilinkedTestEntity extends ManagedEntity<ApiBilinkedTestEntity, TestEntityRef> {
	get friendIds(): TestEntityRef[] {
		return (this.apiModel.friends = this.apiModel.friends || []);
	}

	friends = new BidirectionallyLinkedEntitySet<BilinkedTestEntity, BilinkedTestEntity, TestEntityRef>(
		this,
		() => this.friendIds,
		(url) => this.allEntities.entityForUrl(url),
		(e) => e.friends,
	);

	get name() {
		return this.apiModel.name;
	}
	set name(name: string) {
		this.apiModel.name = name;
	}

	get value() {
		return this.apiModel.value;
	}
	set value(value: number) {
		this.apiModel.value = value;
	}

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiBilinkedTestEntity,
		private allEntities: ManagedEntitySet<BilinkedTestEntity, ApiBilinkedTestEntity>,
	) {
		super(commonManager);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			slug: this.apiModel.slug,
			'@id': this.apiModel.id,
		};
	}
}

export function verifyLinkedEntitySet<
	SetType extends ListBackedLinkedEntitySet<any, EntityType, ApiRefType>,
	EntityType extends ManagedEntity<unknown, ApiRefType>,
	ApiRefType extends ApiEntityRef,
>(entitySet: SetType, refData: AnyRefType[]): SetType {
	expect(entitySet.entities.length).toBe(refData.length);

	refData.forEach((apiRef) => {
		const entity = entitySet.entityForRef(apiRef);

		expect(entity).toBeDefined();
		expect(EntityRef.urlForRef(entity.ref)).toEqual(EntityRef.urlForRef(apiRef));
	});

	return entitySet;
}
