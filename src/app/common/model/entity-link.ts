import { ManagedEntity } from './managed-entity';
import { UpdatableSubject } from '../util/updatable-subject';
import { ApiEntityRef } from './entity-ref';
import { first } from 'rxjs/operators';
import { MemoizedProperty } from '../util/memoized-property-decorator';

/**
 * Represents a many-to-one connection between entities. Wraps an EntityRef from API data and handles loading and
 * maintaining the reference to the linked entity.
 */
export class EntityLink<EntityType extends ManagedEntity<unknown, RefType>, RefType extends ApiEntityRef> {
	protected _requested = false;
	protected _entity: EntityType;

	protected changedSubject = new UpdatableSubject<EntityType>();
	protected loadedSubject = new UpdatableSubject<EntityType>(() => this.updateLink());

	protected _loadedPromise: Promise<EntityType> | null = null;

	get loaded$() {
		return this.loadedSubject.asObservable();
	}

	get changed$() {
		return this.changedSubject.asObservable();
	}

	get entity() {
		// Calling this.promise will ensure that we load the entity
		return this.loadedPromise && this._entity;
	}

	get isPresent(): boolean {
		return !!this.entityRef;
	}

	@MemoizedProperty()
	get loadedPromise() {
		if (!this._loadedPromise) {
			this._loadedPromise = this.loaded$.pipe(first()).toPromise();
		}
		return this._loadedPromise;
	}

	get entityRef(): RefType {
		return this.getRef();
	}

	constructor(
		protected owningEntity: ManagedEntity<unknown, ApiEntityRef>,
		protected fetchEntity: (ref: RefType) => Promise<EntityType>,
		protected getRef: () => RefType,
	) {
		this.changedSubject.subscribe(this.loadedSubject);
		this.changedSubject.subscribe(() => (this._loadedPromise = null));
	}

	protected updateLink() {
		if (!this._requested) {
			this._requested = true;
			this.owningEntity.changed$.subscribe(() => this.updateLink());
		}

		const entityRef = this.entityRef;

		if (entityRef) {
			this.fetchEntity(entityRef).then(
				(entity) => {
					this._entity = entity;
					this.changedSubject.safeNext(entity);
				},
				(error) => {
					console.error(`Failed to fetch entity using ${this.fetchEntity}`, error);
					this.changedSubject.error(error);
				},
			);
		} else {
			this._entity = null;
			this.changedSubject.safeNext(null);
		}
	}
}

/**
 * An EntityLink that supports mutation of the link.
 */
export class MutableEntityLink<
	EntityType extends ManagedEntity<unknown, RefType>,
	RefType extends ApiEntityRef,
> extends EntityLink<EntityType, RefType> {
	constructor(
		owningEntity: ManagedEntity<unknown, ApiEntityRef>,
		fetchEntity: (ref: RefType) => Promise<EntityType>,
		getRef: () => RefType,
		protected setRef: (ref: RefType) => void,
	) {
		super(owningEntity, fetchEntity, getRef);
	}

	// NOTE: We must duplicate the getters for entity and entityRef, otherwise they will be missing due to
	// TypeScript issue: https://github.com/Microsoft/TypeScript/issues/338
	get entity() {
		return this.loadedPromise && this._entity;
	}
	set entity(entity: EntityType) {
		this.entityRef = entity.ref.apiRef;
	}

	get entityRef(): RefType {
		return this.getRef();
	}
	set entityRef(newRef: RefType) {
		this.setRef(newRef);
		this.updateLink();
	}
}
