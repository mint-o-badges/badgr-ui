import { ManagedEntity } from '../../common/model/managed-entity';
import { ApiEntityRef } from '../../common/model/entity-ref';
import {
	ApiRecipientBadgeCollection,
	ApiRecipientBadgeCollectionEntry,
	RecipientBadgeCollectionEntryRef,
	RecipientBadgeCollectionRef,
	RecipientBadgeCollectionUrl,
} from './recipient-badge-collection-api.model';
import { RecipientBadgeInstance } from './recipient-badge.model';
import { EmbeddedEntitySet } from '../../common/model/managed-entity-set';
import { CommonEntityManager } from '../../entity-manager/services/common-entity-manager.service';
import { RecipientBadgeInstanceSlug } from './recipient-badge-api.model';

export class RecipientBadgeCollection extends ManagedEntity<ApiRecipientBadgeCollection, RecipientBadgeCollectionRef> {
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
	get shareHash(): string {
		return this.apiModel.share_hash;
	}
	get shareUrl(): string {
		return this.apiModel.share_url;
	}

	set published(published: boolean) {
		this.apiModel.published = published;
	}
	get published(): boolean {
		return this.apiModel.published;
	}

	get badges(): RecipientBadgeInstance[] {
		return this.badgeEntries.entities.map((e) => e.badge);
	}
	get badgesPromise(): Promise<RecipientBadgeInstance[]> {
		return Promise.all([
			this.badgeEntries.loadedPromise,
			this.recipientBadgeManager.recipientBadgeList.loadedPromise,
		]).then(([list]) => list.entities.map((e) => e.badge));
	}
	badgeEntries = new EmbeddedEntitySet<
		RecipientBadgeCollection,
		RecipientBadgeCollectionEntry,
		ApiRecipientBadgeCollectionEntry
	>(
		this,
		() => this.apiModel.badges,
		(apiEntry) => new RecipientBadgeCollectionEntry(this, apiEntry),
		(apiEntry) => RecipientBadgeCollectionEntry.urlFromApiModel(this, apiEntry),
	);

	static urlForApiModel(apiModel: ApiRecipientBadgeCollection): RecipientBadgeCollectionUrl {
		return 'badgr:badge-collection/' + apiModel.slug;
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': RecipientBadgeCollection.urlForApiModel(this.apiModel),
			slug: this.apiModel.slug,
		};
	}

	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiRecipientBadgeCollection = null,
		onUpdateSubscribed: () => void = undefined,
	) {
		super(commonManager, onUpdateSubscribed);

		this.badgeEntries.changed$.subscribe((changes) =>
			changes.added
				.concat(changes.removed)
				.forEach((entry) => (entry.badge ? entry.badge.collections.updateLinkedSet() : void 0)),
		);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	/**
	 * Updates the set of badges held in this collection, without adding per-badge metadata (e.g. descriptions). Any
	 * metadata that already exists for a badge is kept, and new badges are added without metadata.
	 *
	 * @param newBadges The new set of badges that this collection should hold
	 */
	updateBadges(newBadges: RecipientBadgeInstance[]) {
		// To preserve descriptions set on existing badge entries, we need to do a two-step update, rather than blowing
		// away the list with a new value

		let newApiList = this.apiModel.badges || [];

		// Only keep entries that are still referenced in the new list
		newApiList = newApiList.filter((e) => newBadges.find((b) => b.slug === e.id) != null);

		// Add entries for badges that aren't in the API list
		newApiList.push(
			...newBadges
				.filter((b) => !newApiList.find((a) => a.id === b.slug))
				.map(
					(b) =>
						({
							id: b.slug,
							description: null,
						}) as ApiRecipientBadgeCollectionEntry,
				),
		);

		this.apiModel.badges = newApiList;
		this.applyApiModel(this.apiModel, /* externalChange */ false);
	}

	save(): Promise<this> {
		return this.recipientBadgeCollectionManager.recipientBadgeCollectionApiService
			.saveRecipientBadgeCollection(this.apiModel)
			.then((newModel) => this.applyApiModel(newModel));
	}

	deleteCollection(): Promise<void> {
		return this.recipientBadgeCollectionManager.recipientBadgeCollectionApiService
			.removeRecipientBadgeCollection(this.slug)
			.then(() => this.recipientBadgeCollectionManager.recipientBadgeCollectionList.remove(this))
			.then(() => void 0);
	}

	containsBadge(badge: RecipientBadgeInstance): boolean {
		return !!this.badgeEntries.entities.find((e) => e.badgeSlug === badge.slug);
	}

	addBadge(badge: RecipientBadgeInstance) {
		if (!this.containsBadge(badge)) {
			this.badgeEntries.addOrUpdate({
				id: badge.slug,
				description: '',
			});
		}
	}

	removeBadge(badge: RecipientBadgeInstance): boolean {
		return this.badgeEntries.remove(this.badgeEntries.entities.find((e) => e.badgeSlug === badge.slug));
	}
}

export class RecipientBadgeCollectionEntry extends ManagedEntity<
	ApiRecipientBadgeCollectionEntry,
	RecipientBadgeCollectionEntryRef
> {
	get badgeSlug(): RecipientBadgeInstanceSlug {
		return String(this.apiModel.id);
	}

	get badge(): RecipientBadgeInstance {
		return this.recipientBadgeManager.recipientBadgeList.entityForSlug(this.badgeSlug);
	}

	get description(): string {
		return this.apiModel.description;
	}

	set description(description: string) {
		this.apiModel.description = description;
	}

	static urlFromApiModel(collection: RecipientBadgeCollection, apiModel: ApiRecipientBadgeCollectionEntry) {
		return `badgr:badge-collection/${collection.slug}/entry/${apiModel.id}`;
	}
	constructor(
		public collection: RecipientBadgeCollection,
		initialEntity: ApiRecipientBadgeCollectionEntry = null,
	) {
		super(collection.commonManager, null);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			'@id': RecipientBadgeCollectionEntry.urlFromApiModel(this.collection, this.apiModel),
			slug: `badge-collection-${this.collection.slug}-entry-${this.apiModel.id}`,
		};
	}
}
