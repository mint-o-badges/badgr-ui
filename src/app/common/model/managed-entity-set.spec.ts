import { ManagedEntity } from './managed-entity';
import { ListBackedEntitySet, ManagedEntitySet, StandaloneEntitySet } from './managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { ApiTestEntity, buildTestEntities, TestEntity } from './managed-entity.spec';
import { inject, TestBed } from '@angular/core/testing';
import { filter, first } from 'rxjs/operators';

describe('StandaloneEntitySet', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		new TestEntitySet(commonManager);
	}));

	it('should report initial state correctly', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const list = new TestEntitySet(commonManager);

		expect(list.loaded).toBe(false);
		expect(list.entities.length).toBe(0);
		expect(Object.keys(list.entityByUrlMap).length).toBe(0);
	}));

	it('should correctly initially load a list of entities', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			let resolveLoadedCalled: (value: unknown) => void;
			const loadedCalledPromise = new Promise((r) => (resolveLoadedCalled = r));

			const { testApiEntities } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => {
				resolveLoadedCalled(null);
				return Promise.resolve(testApiEntities);
			});

			return Promise.all([
				list.loadedPromise,
				verifyEntitySetWhenLoaded(list, testApiEntities),
				loadedCalledPromise,
			]);
		},
	));

	it('should update entities from updateIfLoaded() if already loaded', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const loadRequestedCallbacks: Array<(value: unknown) => void> = [];
			let loadRequestedCount = 0;
			const loadRequestedPromises = [
				new Promise((r) => (loadRequestedCallbacks[0] = r)),
				new Promise((r) => (loadRequestedCallbacks[1] = r)),
			];

			const { testApiEntities } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => {
				loadRequestedCallbacks[loadRequestedCount++](null);
				return Promise.resolve(testApiEntities);
			});

			return Promise.all([
				Promise.all([
					list.loadedPromise,
					verifyEntitySetWhenLoaded(list, testApiEntities),
					loadRequestedPromises[0],
				]),
				list.updateIfLoaded(),
				loadRequestedPromises[1],
			]);
		},
	));

	it('should NOT update entities from updateIfLoaded() if NOT loaded', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			let loadRequested = false;

			const { testApiEntities } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => {
				loadRequested = true;
				throw new Error('List should not be loaded!');
			});

			expect(list.updateIfLoaded()).toBe(null);
		},
	));

	it('should correctly handle a new entity when updated', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const { testApiEntity1, testApiEntity2 } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1]));

			return Promise.all<unknown>([
				list.loadedPromise.then((l) => list.applyApiData([testApiEntity1, testApiEntity2])),
				list.loaded$
					.pipe(
						filter((list) => list.entities.length === 2),
						first(),
					)
					.toPromise()
					.then((update) => verifyManagedEntitySet(list, [testApiEntity1, testApiEntity2])),
			]);
		},
	));

	it('should correctly handle a removed entity when updated', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const { testApiEntity1, testApiEntity2 } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1, testApiEntity2]));

			return Promise.all<unknown>([
				list.loadedPromise.then((l) => list.applyApiData([testApiEntity1])),
				list.loaded$
					.pipe(
						filter((list) => list.entities.length === 1),
						first(),
					)
					.toPromise()
					.then((update) => verifyManagedEntitySet(list, [testApiEntity1])),
			]);
		},
	));

	it('should correctly remove an entity', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { testApiEntity1, testApiEntity2 } = buildTestEntities();

		const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1, testApiEntity2]));

		return Promise.all<unknown>([
			list.loadedPromise.then((l) => {
				const entityToRemove = l.entityForApiEntity(testApiEntity2);

				expect(list.remove(entityToRemove)).toBeTruthy();
				expect(list.remove(entityToRemove)).toBeFalsy();
			}),
			list.loaded$
				.pipe(
					filter((list) => list.entities.length === 1),
					first(),
				)
				.toPromise()
				.then((update) => verifyManagedEntitySet(list, [testApiEntity1])),
		]);
	}));

	it('should correctly remove several entities', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const { testApiEntity1, testApiEntity2, testApiEntity3 } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () =>
				Promise.resolve([testApiEntity1, testApiEntity2, testApiEntity3]),
			);

			return Promise.all<unknown>([
				list.loadedPromise.then((l) => {
					const entitiesToRemove = [
						l.entityForApiEntity(testApiEntity2),
						l.entityForApiEntity(testApiEntity3),
					];

					expect(list.removeAll(entitiesToRemove)).toBeTruthy();
					expect(list.removeAll(entitiesToRemove)).toBeFalsy();
				}),
				list.loaded$
					.pipe(
						filter((list) => list.entities.length === 1),
						first(),
					)
					.toPromise()
					.then((update) => verifyManagedEntitySet(list, [testApiEntity1])),
			]);
		},
	));

	it('should correctly add an entity', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { testApiEntity1, testApiEntity2 } = buildTestEntities();

		const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1]));

		return Promise.all<unknown>([
			list.loadedPromise.then((l) => list.addOrUpdate(testApiEntity2)),
			list.loaded$
				.pipe(
					filter((list) => list.entities.length === 2),
					first(),
				)
				.toPromise()
				.then((update) => verifyManagedEntitySet(list, [testApiEntity1, testApiEntity2])),
		]);
	}));

	it('should correctly update an entity', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { testApiEntity1, testApiEntity2 } = buildTestEntities();

		const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1, testApiEntity2]));

		const updatedApiEntity2 = Object.assign({}, testApiEntity2, { name: 'NewValue' });

		return list.loadedPromise.then(() => {
			list.addOrUpdate(updatedApiEntity2);
			verifyManagedEntitySet(list, [testApiEntity1, updatedApiEntity2]);
		});
	}));

	it('should correctly update the underlying list when an entity is updated out-of-band', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const { testApiEntity1, testApiEntity2 } = buildTestEntities();

			const list = new TestEntitySet(commonManager, () => Promise.resolve([testApiEntity1, testApiEntity2]));

			const updatedApiEntity2 = Object.assign({}, testApiEntity2, { name: 'NewValue' });

			return list.loadedPromise.then(() => {
				list.entityForApiEntity(updatedApiEntity2).applyApiModel(updatedApiEntity2);

				const index = list.apiModelList.findIndex((m) => m.id === updatedApiEntity2.id);
				expect(list.apiModelList[index]).toEqual(updatedApiEntity2);
			});
		},
	));
});

class TestEntitySet extends StandaloneEntitySet<TestEntity, ApiTestEntity> {
	constructor(
		commonManager: CommonEntityManager,
		loadEntities: () => Promise<ApiTestEntity[]> = () => Promise.resolve([]),
	) {
		super(
			() => new TestEntity(commonManager),
			(apiEntity) => apiEntity.id,
			loadEntities,
		);
	}
}

export function verifyManagedEntitySet<
	SetType extends ManagedEntitySet<EntityType, ApiEntityType>,
	EntityType extends ManagedEntity<ApiEntityType, any>,
	ApiEntityType,
>(
	entitySet: SetType,
	apiData: ApiEntityType[],
	additionalVerifier: (entity: EntityType, apiEntity: ApiEntityType) => void = () => true,
): SetType {
	expect(entitySet.entities.length).toBe(apiData.length);

	apiData.forEach((apiEntity) => {
		const entity = entitySet.entityForApiEntity(apiEntity);

		expect(entity).toBeDefined();
		expect(entity.apiModel).toEqual(apiEntity);

		additionalVerifier(entity, apiEntity);
	});

	/*if (entitySet instanceof ListBackedEntitySet) {
		const apiModelList: ApiEntityType[] = (entitySet as ListBackedEntitySet).apiModelList;

		// TODO: Implement better comparison of underlying lists
		expect(apiModelList.length).toEqual(apiData.length);
	}*/

	return entitySet;
}

export function verifyEntitySetWhenLoaded<
	SetType extends ManagedEntitySet<EntityType, ApiEntityType>,
	EntityType extends ManagedEntity<ApiEntityType, any>,
	ApiEntityType,
>(
	entitySet: SetType,
	apiData: ApiEntityType[],
	additionalVerifier: (entity: EntityType, apiEntity: ApiEntityType) => void = () => true,
): Promise<SetType> {
	return entitySet.loadedPromise.then((list) => verifyManagedEntitySet(list, apiData, additionalVerifier));
}
