import { ManagedEntity } from './managed-entity';
import { inject, TestBed } from '@angular/core/testing';
import { ApiEntityRef } from './entity-ref';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

export interface TestApiEntities {
	testApiEntity1: ApiTestEntity;
	testApiEntity2: ApiTestEntity;
	testApiEntity3: ApiTestEntity;
	testApiEntity4: ApiTestEntity;
	testApiEntities: ApiTestEntity[];
}

export function buildTestEntities(): TestApiEntities {
	const testApiEntity1 = {
		id: 'id1',
		slug: 'slug1',
		name: 'name1',
		value: 10,
	} as ApiTestEntity;

	const testApiEntity2 = {
		id: 'id2',
		slug: 'slug2',
		name: 'name2',
		value: 20,
	} as ApiTestEntity;

	const testApiEntity3 = {
		id: 'id3',
		slug: 'slug3',
		name: 'name3',
		value: 30,
	} as ApiTestEntity;

	const testApiEntity4 = {
		id: 'id4',
		slug: 'slug4',
		name: 'name4',
		value: 40,
	} as ApiTestEntity;

	const testApiEntities: ApiTestEntity[] = [testApiEntity1, testApiEntity2, testApiEntity3];

	return {
		testApiEntity1,
		testApiEntity2,
		testApiEntity3,
		testApiEntity4,
		testApiEntities,
	};
}

function verifyEntity(entity: TestEntity, apiEntity: ApiTestEntity) {
	expect(entity.slug).toBe(apiEntity.slug);
	expect(entity.url).toBe(apiEntity.id);
	expect(entity.name).toBe(apiEntity.name);
	expect(entity.value).toBe(apiEntity.value);
	expect(entity.apiModel).toEqual(apiEntity);
}

describe('ManagedEntity', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			providers: [CommonEntityManager],
		}),
	);

	it('should be constructable', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		new TestEntity(commonManager);
	}));
	it('should gracefully handle having no model', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const entity = new TestEntity(commonManager);

			expect(entity.url).toBe(null);
			expect(entity.slug).toBe(null);

			entity.revertChanges();
			entity.hasChanges;
			entity.apiModel;
		},
	));

	it('should apply an api model successfully', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { testApiEntity1 } = buildTestEntities();

		const entity = new TestEntity(commonManager);
		entity.applyApiModel(testApiEntity1);
		verifyEntity(entity, testApiEntity1);
	}));

	it('should detect changes from the last api model', inject(
		[CommonEntityManager],
		(commonManager: CommonEntityManager) => {
			const { testApiEntity1 } = buildTestEntities();
			const entity = new TestEntity(commonManager);
			entity.applyApiModel(testApiEntity1);
			verifyEntity(entity, testApiEntity1);
			entity.name = 'New Name';
			expect(entity.hasChanges).toBe(true);
		},
	));

	it('should revert changes successfully', inject([CommonEntityManager], (commonManager: CommonEntityManager) => {
		const { testApiEntity1 } = buildTestEntities();
		const entity = new TestEntity(commonManager);
		entity.applyApiModel(testApiEntity1);
		verifyEntity(entity, testApiEntity1);
		entity.name = entity.name + 123;

		expect(entity.hasChanges).toBe(true);
		expect(entity.revertChanges()).toBe(true);

		expect(entity.hasChanges).toBe(false);
		expect(entity.revertChanges()).toBe(false);
	}));
});

export interface TestEntityRef extends ApiEntityRef {}

export interface ApiTestEntity {
	id: string;
	slug: string;
	name: string;
	value: number;
}

export class TestEntity extends ManagedEntity<ApiTestEntity, TestEntityRef> {
	constructor(commonManager: CommonEntityManager, initialEntity: ApiTestEntity = null) {
		super(commonManager);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

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

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': this.apiModel.id,
			slug: this.apiModel.slug,
		};
	}
}
