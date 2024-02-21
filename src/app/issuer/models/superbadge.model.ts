import {ManagedEntity} from '../../common/model/managed-entity';
import {ApiEntityRef} from '../../common/model/entity-ref';
import {ApiSuperBadge, ApiSuperBadgeEntry, SuperBadgeEntryRef, SuperbadgeRef} from './superbadge-api.model'
import { BadgeClass } from './badgeclass.model';
import {EmbeddedEntitySet} from '../../common/model/managed-entity-set';
import {CommonEntityManager} from '../../entity-manager/services/common-entity-manager.service';

export class SuperBadge extends ManagedEntity<ApiSuperBadge, SuperbadgeRef> {

	get name(): string { return this.apiModel.name; }
	set name(name: string) { this.apiModel.name = name; }

	get description(): string { return this.apiModel.description; }
	set description(description: string) { this.apiModel.description = description; }

	get slug(): string { return this.apiModel.slug; }
	get image(): string { return this.apiModel.image; }

	// get shareHash(): string { return this.apiModel.share_hash; }
	// get shareUrl(): string { return this.apiModel.share_url; }

	// set published(published: boolean) { this.apiModel.published = published; }
	// get published(): boolean { return this.apiModel.published; }

	get badges(): BadgeClass[] { return this.badgeEntries.entities.map(e => e.badge); }
	get badgesPromise(): Promise<BadgeClass[]> {
		return Promise.all([
			this.badgeEntries.loadedPromise,
			this.superBadgeManager.superBadgeList.loadedPromise
		]).then(
			([list]) => list.entities.map(e => e.badge)
		);
	}
	badgeEntries = new EmbeddedEntitySet<
		SuperBadge,
		SuperBadgeEntry,
        ApiSuperBadgeEntry
	>(
		this,
		() => this.apiModel.badges,
		apiEntry => new SuperBadgeEntry(this, apiEntry),
		apiEntry => SuperBadgeEntry.urlFromApiModel(this, apiEntry)
	);

	static urlForApiModel(apiModel: ApiSuperBadge): string {
		return "badgr:badge-collection/" + apiModel.slug;
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			"@id": SuperBadge.urlForApiModel(this.apiModel),
			slug: this.apiModel.slug,
		};
	}


	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiSuperBadge = null,
		onUpdateSubscribed: () => void = undefined
	) {
		super(commonManager, onUpdateSubscribed);

		// this.badgeEntries.changed$.subscribe(
		// 	changes => (changes.added.concat(changes.removed)).forEach(
		// 		entry => entry.badge ? entry.badge.collections.updateLinkedSet() : void 0
		// 	)
		// );

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
	updateBadges(
		newBadges: BadgeClass[]
	) {
		// To preserve descriptions set on existing badge entries, we need to do a two-step update, rather than blowing
		// away the list with a new value

		let newApiList = (this.apiModel.badges || []);

		// Only keep entries that are still referenced in the new list
		newApiList = newApiList.filter(e => newBadges.find(b => b.slug === e.id) != null);

		// Add entries for badges that aren't in the API list
		newApiList.push(
			... newBadges
				.filter(b => !newApiList.find(a => a.id === b.slug))
				.map(b => ({
					id: b.slug,
					description: null
				} as ApiSuperBadgeEntry))
		);

		this.apiModel.badges = newApiList;
		this.applyApiModel(this.apiModel, /* externalChange */false);
	}

	save(): Promise<this> {
		return this.superBadgeManager.superBadgeApiService
			.saveSuperBadge(this.apiModel)
			.then(newModel => this.applyApiModel(newModel));
	}

	// deleteCollection(): Promise<void> {
	// 	return this.recipientBadgeCollectionManager.recipientBadgeCollectionApiService
	// 		.removeRecipientBadgeCollection(this.slug)
	// 		.then(() => this.recipientBadgeCollectionManager.recipientBadgeCollectionList.remove(this))
	// 		.then(() => void 0);
	// }

	containsBadge(badge: BadgeClass): boolean {
		return !! this.badgeEntries.entities.find(e => e.badgeSlug === badge.slug);
	}

	addBadge(badge: BadgeClass) {
		if (! this.containsBadge(badge)) {
			this.badgeEntries.addOrUpdate({
				id: badge.slug,
				description: ""
			});
		}
	}

	removeBadge(badge: BadgeClass): boolean {
		return this.badgeEntries.remove(
			this.badgeEntries.entities.find(e => e.badgeSlug === badge.slug)
		);
	}
}

export class SuperBadgeEntry extends ManagedEntity<
	ApiSuperBadgeEntry,
	SuperBadgeEntryRef
> {

	get badgeSlug(): string {
		return String(this.apiModel.id);
	}

	get badge(): any {
		return this.superBadgeManager.superBadgeList.entityForSlug(this.badgeSlug);
	}

	get description(): string {
		return this.apiModel.description;
	}

	set description(description: string) {
		this.apiModel.description = description;
	}

	static urlFromApiModel(
		superBadge: SuperBadge,
		apiModel: ApiSuperBadgeEntry
	) {
		return `badgr:superbadge/${superBadge.slug}/entry/${apiModel.id}`;
	}
	constructor(
		public superBadge: SuperBadge,
		initialEntity: ApiSuperBadgeEntry = null,
	) {
		super(superBadge.commonManager, null);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			"@id": SuperBadgeEntry.urlFromApiModel(this.superBadge, this.apiModel),
			slug: `badge-collection-${this.superBadge.slug}-entry-${this.apiModel.id}`,
		};
	}
}
