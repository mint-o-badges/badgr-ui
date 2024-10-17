import { Observable } from 'rxjs';
import { UpdatableSubject } from '../util/updatable-subject';
import { AnyManagedEntity, ManagedEntity } from './managed-entity';
import { AnyRefType, ApiEntityRef, EntityRef } from './entity-ref';
import { EntitySet, EntitySetUpdate } from './entity-set';
import { first, map } from 'rxjs/operators';

/**
 * Manages a set of entities based on API data. This set and its children act as the primary holders and creators of
 * entities. ListBackedLinkedEntitySet can be used to manage sets of references to other entities.
 *
 * Generally, this class should not be used directly:
 * - For managers and other standalone lists, use StandaloneEntitySet
 * - For entities embedded in other entities, use EmbeddedEntitySet
 */
export class ManagedEntitySet<EntityType extends ManagedEntity<ApiEntityType, any>, ApiEntityType>
	implements EntitySet<EntityType>
{
	/**
	 * Observable for updates to this entire entity list. Updates are sent upon subscription (like a promise) if the
	 * value already exists, and later, upon any change to the list. The entity list will always be complete when
	 * updates are sent out on this subject.
	 *
	 * @returns {Observable<ManagedEntitySet>}
	 */
	get loaded$(): Observable<this> {
		//@ts-ignore
		return this.loadedSubject.asObservable();
	}

	get changed$(): Observable<EntitySetUpdate<EntityType, this>> {
		return this.changedSubject.asObservable();
	}

	/**
	 * The Promise representing the first successful population of this entity list.
	 *
	 * @returns {any}
	 */
	get loadedPromise(): Promise<this> {
		return this._loadedPromise
			? this._loadedPromise
			: (this._loadedPromise = this.loaded$.pipe(first()).toPromise());
	}

	get loaded() {
		return this.loadedSubject.isLoaded;
	}

	get entities() {
		return this._entities;
	}
	get length(): number {
		return this.entities.length;
	}

	get entityByUrlMap() {
		return this.urlEntityMap;
	}
	protected _entities: EntityType[] = [];

	protected _loadedPromise: Promise<this> = null;
	private urlEntityMap: { [url: string]: EntityType } = {};
	private slugEntityMap: { [slug: string]: EntityType } = {};

	private loadedSubject = new UpdatableSubject<EntitySetUpdate<EntityType, this>>(() => this.onFirstListRequest());

	private changedSubject = new UpdatableSubject<EntitySetUpdate<EntityType, this>>();

	constructor(
		protected entityFactory: (apiModel: ApiEntityType) => EntityType,
		protected urlForApiModel: (apiModel: ApiEntityType) => string,
	) {
		//@ts-ignore
		this.changedSubject.pipe(map((u) => u.entitySet)).subscribe(this.loadedSubject);
	}

	/**
	 * Called the first time a request is made for the entity set, can be used to initialize.
	 */
	protected onFirstListRequest() {
		/* For subclasses */
	}
	protected updateSetUsingApiModels(apiEntities: ApiEntityType[]) {
		if (apiEntities) {
			const inputByUrl: { [url: string]: ApiEntityType } = {};
			apiEntities.forEach((i) => (inputByUrl[this.urlForApiModel(i)] = i));

			const apiEntityUrls = Object.keys(inputByUrl);
			const existingUrls = Object.keys(this.urlEntityMap);

			const updateInfo = new EntitySetUpdate<EntityType, this>(this);

			apiEntityUrls.forEach((id) => {
				if (id in this.urlEntityMap) {
					this.urlEntityMap[id].applyApiModel(inputByUrl[id]);
				} else {
					const newEntity = (this.urlEntityMap[id] = this.entityFactory(inputByUrl[id]));
					newEntity.applyApiModel(inputByUrl[id]);
					this.entities.push(newEntity);
					updateInfo.added.push(newEntity);

					this.onEntityAdded(newEntity);
				}
			});

			existingUrls.forEach((previousUrl) => {
				if (previousUrl in inputByUrl) {
					/* Old Id still present, no action */
				} else {
					updateInfo.removed.push(this.urlEntityMap[previousUrl]);
					delete this.urlEntityMap[previousUrl];
				}
			});

			// Rebuild the entity array from the inputs to keep them in order
			this._entities.length = 0;
			Object.keys(this.urlEntityMap).forEach((id) => this._entities.push(this.urlEntityMap[id]));
			this.notifySubjects(updateInfo);
			this.updateSlugMap();
		}
	}

	protected onEntityAdded(entity: EntityType) {
		/* For subclasses */
	}

	entityForUrl(url: AnyRefType): EntityType {
		return this.urlEntityMap[EntityRef.urlForRef(url)];
	}
	entitiesForUrls(urls: AnyRefType[]): EntityType[] {
		return urls.map((url) => this.urlEntityMap[EntityRef.urlForRef(url)]);
	}

	entityForSlug(slug: string): EntityType {
		return this.slugEntityMap[slug];
	}

	entityForApiEntity(apiEntity: ApiEntityType): EntityType {
		return this.entityForUrl(this.urlForApiModel(apiEntity));
	}

	entitiesForApiEntities(apiEntities: ApiEntityType[]): EntityType[] {
		return apiEntities.map((a) => this.entityForUrl(this.urlForApiModel(a)));
	}

	[Symbol.iterator](): Iterator<EntityType> {
		return this.entities[Symbol.iterator]();
	}

	private notifySubjects(updateInfo: EntitySetUpdate<EntityType, this>) {
		this.changedSubject.safeNext(updateInfo);
	}

	private updateSlugMap() {
		Object.keys(this.slugEntityMap).forEach((slug) => {
			delete this.slugEntityMap[slug];
		});
		this.entities.forEach((entity) => (this.slugEntityMap[entity.slug] = entity));
	}
}

export class ListBackedEntitySet<
	EntityType extends ManagedEntity<ApiEntityType, ApiEntityRef>,
	ApiEntityType,
> extends ManagedEntitySet<EntityType, ApiEntityType> {
	constructor(
		protected getBackingList: () => ApiEntityType[],
		entityFactory: (apiModel: ApiEntityType) => EntityType,
		urlForApiModel: (apiModel: ApiEntityType) => string,
	) {
		super(entityFactory, urlForApiModel);
	}

	protected onEntityAdded(entity: EntityType) {
		entity.changed$.subscribe(() => {
			// Update the model list with the new model from the entity so our backing list is kept up-to-date
			const modelIndex = this.apiModelList.findIndex((m) => this.urlForApiModel(m) === entity.url);

			if (modelIndex < 0) {
				// The entity is no longer part of our list. We can safely ignore changes.
			} else {
				this.apiModelList[modelIndex] = entity.apiModel;
			}
		});
	}

	addOrUpdate(newModel: ApiEntityType): EntityType {
		const newUrl = this.urlForApiModel(newModel);
		const modelIndex = this.apiModelList.findIndex((m) => this.urlForApiModel(m) === newUrl);

		if (modelIndex < 0) {
			this.apiModelList.push(newModel);
		} else {
			this.apiModelList[modelIndex] = newModel;
		}

		this.onBackingListChanged();

		return this.entityForApiEntity(newModel);
	}

	remove(entity: EntityType): boolean {
		if (!entity) {
			return false;
		}

		const index = this.apiModelList.findIndex((a) => this.urlForApiModel(a) === entity.url);

		if (index >= 0) {
			this.apiModelList.splice(index, 1);
			this.onBackingListChanged();
			return true;
		} else {
			return false;
		}
	}

	removeAll(entities: EntityType[]): boolean {
		let changed = false;
		entities.forEach((entity) => {
			const index = this.apiModelList.findIndex((a) => this.urlForApiModel(a) === entity.url);

			if (index >= 0) {
				this.apiModelList.splice(index, 1);
				changed = true;
			}
		});

		if (changed) {
			this.onBackingListChanged();
		}

		return changed;
	}

	get apiModelList(): ApiEntityType[] {
		return this.getBackingList();
	}

	protected onBackingListChanged() {
		this.updateSetUsingApiModels(this.apiModelList);
	}
}

/**
 * Manages a set of entities that are embedded in another entity, are are stored in full in that entity.
 *
 * See RecipientBadgeCollection.entries for an example of the usage.
 */
export class EmbeddedEntitySet<
	OwnerType extends AnyManagedEntity,
	EntityType extends ManagedEntity<ApiEntityType, ApiEntityRef>,
	ApiEntityType,
> extends ListBackedEntitySet<EntityType, ApiEntityType> {
	constructor(
		protected owner: OwnerType,
		getBackingList: () => ApiEntityType[],
		entityFactory: (apiModel: ApiEntityType) => EntityType,
		urlForApiModel: (apiModel: ApiEntityType) => string,
	) {
		super(getBackingList, entityFactory, urlForApiModel);

		owner.changed$.subscribe(() => this.onBackingListChanged());
	}
}

/**
 * Manages a set of entities that are embedded in another entity logically, but may not initially be loaded.
 */
export class LazyEmbeddedEntitySet<
	OwnerType extends AnyManagedEntity,
	EntityType extends ManagedEntity<ApiEntityType, ApiEntityRef>,
	ApiEntityType,
> extends ListBackedEntitySet<EntityType, ApiEntityType> {
	constructor(
		protected owner: OwnerType,
		getCurrentApiList: () => ApiEntityType[],
		private loadApiList: () => Promise<ApiEntityType[]>,
		entityFactory: (apiModel: ApiEntityType) => EntityType,
		urlForApiModel: (apiModel: ApiEntityType) => string,
	) {
		super(getCurrentApiList, entityFactory, urlForApiModel);

		owner.changed$.subscribe(() => this.onBackingListChanged());
	}

	protected onFirstListRequest() {
		this.loadApiList().then((apiEntities) => this.updateSetUsingApiModels(apiEntities));
	}
}

/**
 * Holds a set of entities that are backed by some external logic rather than another entity. Used in managers and
 * other places that have the ability to load new entities, but aren't themselves part of the entity graph.
 */
export class StandaloneEntitySet<
	EntityType extends ManagedEntity<ApiEntityType, ApiEntityRef>,
	ApiEntityType,
> extends ListBackedEntitySet<EntityType, ApiEntityType> {
	private _apiEntities: ApiEntityType[] = [];

	private entireListLoaded = false;
	private entireListRequested = false;
	private listInvalidatedSinceLastUpdate = false;

	constructor(
		entityFactory: (apiModel: ApiEntityType) => EntityType,
		idForApiModel: (apiModel: ApiEntityType) => string,

		protected loadEntireList: () => Promise<ApiEntityType[]>,
	) {
		super(() => this._apiEntities, entityFactory, idForApiModel);
	}

	applyApiData(newApiData: ApiEntityType[]) {
		this._apiEntities.length = 0;
		this._apiEntities.push(...newApiData);
		this.onBackingListChanged();
	}

	protected onFirstListRequest() {
		this.ensureLoaded();
	}

	get entities() {
		this.ensureLoaded();
		return this._entities;
	}

	/**
	 * Request that the contents of this entity list be updated.
	 *
	 * @returns {Promise<ManagedEntitySet>}
	 */
	updateList(): Promise<this> {
		this.listInvalidatedSinceLastUpdate = false;

		return this.loadEntireList().then(
			(allEntities) => {
				if (this.listInvalidatedSinceLastUpdate) {
					return this;
				} else {
					this._apiEntities = allEntities;
					this.onBackingListChanged();
					return this;
				}
			},
			(error) => {
				console.error(`Failed to load list ${error}`);
				throw error;
			},
		);
	}

	/**
	 * Request that the contents of this entity list be updated, if they have already been loaded or requested.
	 *
	 * @returns {Promise<StandaloneEntitySet>} if reloading is necessary, otherwise null
	 */
	updateIfLoaded(): Promise<this> | null {
		if (this.entireListRequested) {
			return this.updateList();
		} else {
			return null;
		}
	}

	/**
	 * Requests that the contents of this list be invalidated (removed).
	 */
	invalidateList() {
		this.entireListRequested = false;
		this.entireListLoaded = false;
		this.listInvalidatedSinceLastUpdate = true;

		this._apiEntities = [];
		this._loadedPromise = null;

		this.onBackingListChanged();
	}

	/**
	 * Ensures that the contents of this list are loaded. Will only fire one request for loading.
	 */
	ensureLoaded() {
		if (!this.entireListRequested) {
			this.entireListRequested = true;

			this.updateList();
		}
	}
}
