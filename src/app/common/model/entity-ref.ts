export interface ApiEntityRef {
	'@id': string;
	slug: string;
}

export type AnyRefType = ApiEntityRef | EntityRef<ApiEntityRef> | string;

export class EntityRef<RefType extends ApiEntityRef> implements ApiEntityRef {
	get '@id'() {
		return this._ref['@id'];
	}
	get url() {
		return this._ref['@id'];
	}
	get slug() {
		return this._ref.slug;
	}

	get apiRef(): RefType {
		return this._ref as RefType;
	}

	get hasSlug(): boolean {
		return !!this.slug;
	}
	_ref: ApiEntityRef;

	static refFrom<T extends ApiEntityRef>(id: EntityRef<T> | T | string): EntityRef<T> {
		return EntityRef.isRef(id) ? id : new EntityRef<T>(id);
	}

	static isApiRef(id: AnyRefType): id is ApiEntityRef {
		const result = typeof id === 'object' && '@id' in id;
		return result;
	}

	static isRef(id: AnyRefType): id is EntityRef<ApiEntityRef> {
		const result = id instanceof EntityRef;
		return result;
	}

	static urlForRef(id: AnyRefType): string {
		return EntityRef.isApiRef(id) ? id['@id'] : id;
	}

	constructor(ref: RefType | EntityRef<RefType> | string, contextSlug?: string) {
		if (EntityRef.isRef(ref)) {
			this._ref = ref.apiRef;
		} else if (EntityRef.isApiRef(ref)) {
			this._ref = Object.assign({}, ref);
		} else {
			this._ref = {
				'@id': ref,
				slug: contextSlug,
			};
		}
	}

	toJSON() {
		return this.apiRef;
	}
}
