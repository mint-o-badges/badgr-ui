import { ManagedEntity } from '../../common/model/managed-entity';
import { ApiEntityRef } from '../../common/model/entity-ref';
import {
	ApiCollectionBadge,
	ApiCollectionBadgeEntry,
	CollectionBadgeEntryRef,
	CollectionbadgeRef,
} from './collectionbadge-api.model';
import { BadgeClass } from './badgeclass.model';
import { EmbeddedEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';

export class CollectionBadge extends ManagedEntity<ApiCollectionBadge, CollectionbadgeRef> {
	get name(): string {
		return this.apiModel.name;
	}
	set name(name: string) {
		this.apiModel.name = name;
	}

	get description(): string {
		return this.apiModel.description;
	}
	set description(description: string) {
		this.apiModel.description = description;
	}

	get slug(): string {
		return this.apiModel.slug;
	}
	get image(): string {
		return this.apiModel.image;
	}

	get badges(): BadgeClass[] {
		return this.badgeEntries.entities.map((e) => e.badge.badges[0]);
	}
	get badgesPromise(): Promise<BadgeClass[]> {
		return Promise.all([
			this.badgeEntries.loadedPromise,
			this.collectionBadgeManager.collectionBadgeList.loadedPromise,
		]).then(([list]) => list.entities.map((e) => e.badge.badges[0]));
	}
	badgeEntries = new EmbeddedEntitySet<CollectionBadge, CollectionBadgeEntry, ApiCollectionBadgeEntry>(
		this,
		() => this.apiModel.badges,
		(apiEntry) => new CollectionBadgeEntry(this, apiEntry),
		(apiEntry) => CollectionBadgeEntry.urlFromApiModel(this, apiEntry),
	);

	static urlForApiModel(apiModel: ApiCollectionBadge): string {
		return 'badgr:badge-collection/' + apiModel.slug;
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': CollectionBadge.urlForApiModel(this.apiModel),
			slug: this.apiModel.slug,
		};
	}

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiCollectionBadge = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	/**
	 * Updates the set of badges held in this collectionbadge, without adding per-badge metadata (e.g. descriptions). Any
	 * metadata that already exists for a badge is kept, and new badges are added without metadata.
	 *
	 * @param newBadges The new set of badges that this collectionbadge should hold
	 */
	updateBadges(newBadges: BadgeClass[]) {
		// To preserve descriptions set on existing badge entries, we need to do a two-step update, rather than blowing
		// away the list with a new value

		let newApiList = this.apiModel.badges || [];

		this.apiModel.badges = newApiList;
		this.applyApiModel(this.apiModel, /* externalChange */ false);
	}

	save(): Promise<this> {
		return this.collectionBadgeManager.collectionBadgeApiService
			.saveCollectionBadge(this.apiModel)
			.then((newModel) => this.applyApiModel(newModel));
	}

	containsBadge(badge: BadgeClass): boolean {
		return !!this.badgeEntries.entities.find((e) => e.badgeSlug === badge.slug);
	}

	addBadge(badge: BadgeClass) {
		if (!this.containsBadge(badge)) {
			this.badgeEntries.addOrUpdate({
				slug: badge.slug,
			});
		}
	}

	removeBadge(badge: BadgeClass): boolean {
		return this.badgeEntries.remove(this.badgeEntries.entities.find((e) => e.badgeSlug === badge.slug));
	}
}

export class CollectionBadgeEntry extends ManagedEntity<ApiCollectionBadgeEntry, CollectionBadgeEntryRef> {
	get badgeSlug(): string {
		return String(this.apiModel.slug);
	}

	get badge(): CollectionBadge {
		return this.collectionBadgeManager.collectionBadgeList.entityForSlug(this.badgeSlug);
	}

	static urlFromApiModel(collectionBadge: CollectionBadge, apiModel: ApiCollectionBadgeEntry) {
		return `badgr:collectionbadge/${collectionBadge.slug}/entry/${apiModel.slug}`;
	}
	constructor(
		public collectionBadge: CollectionBadge,
		initialEntity: ApiCollectionBadgeEntry = null,
	) {
		super(collectionBadge.commonManager, null);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': CollectionBadgeEntry.urlFromApiModel(this.collectionBadge, this.apiModel),
			slug: `badge-collection-${this.collectionBadge.slug}-entry-${this.apiModel.slug}`,
		};
	}
}
