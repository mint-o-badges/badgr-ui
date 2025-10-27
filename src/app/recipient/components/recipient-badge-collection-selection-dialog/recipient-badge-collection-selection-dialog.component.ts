import { Component, ElementRef, Renderer2, inject } from '@angular/core';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';
import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { MessageService } from '../../../common/services/message.service';
import { SettingsService } from '../../../common/services/settings.service';
import { SvgIconComponent } from '../../../common/components/svg-icon.component';
import { FormsModule } from '@angular/forms';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';
import { MatchingAlgorithm } from '~/common/util/matching-algorithm';

export interface RecipientBadgeCollectionSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;
	omittedCollection: RecipientBadgeInstance;
}

@Component({
	selector: 'recipient-badge-collection-selection-dialog',
	templateUrl: './recipient-badge-collection-selection-dialog.component.html',
	imports: [SvgIconComponent, FormsModule, BgAwaitPromises],
})
export class RecipientBadgeCollectionSelectionDialogComponent extends BaseDialog {
	private badgeManager = inject(RecipientBadgeManager);
	private recipientBadgeCollectionManager = inject(RecipientBadgeCollectionManager);
	private messageService = inject(MessageService);
	private settingsService = inject(SettingsService);

	get searchQuery() {
		return this._searchQuery;
	}

	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}
	dialogId = 'recipientBadgeCollectionSelection';
	dialogTitle = 'Select Badges';

	collectionListLoaded: Promise<unknown>;
	badgeCollections: RecipientBadgeCollection[];
	badgeCollectionsResults: RecipientBadgeCollection[] = [];

	omittedCollection: RecipientBadgeInstance;
	selectedCollections: RecipientBadgeCollection[] = [];

	private resolveFunc: { (collection: RecipientBadgeCollection[]): void };
	private _searchQuery = '';

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const componentElem = inject(ElementRef);
		const renderer = inject(Renderer2);

		super(componentElem, renderer);
	}

	openDialog({
		dialogId,
		dialogTitle,
		omittedCollection,
	}: RecipientBadgeCollectionSelectionDialogOptions): Promise<RecipientBadgeCollection[]> {
		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.omittedCollection = omittedCollection;
		this.selectedCollections = [];
		this._searchQuery = '';

		this.showModal();
		this.updateData();

		return new Promise<RecipientBadgeCollection[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(this.selectedCollections);
	}

	updateData() {
		this.collectionListLoaded = this.recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise
			.then((r) => {
				this.badgeCollections = r.entities;
				this.updateResults();
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load your badges', e));
	}

	updateCollection(checkedCollection: RecipientBadgeCollection, checked: boolean) {
		if (checked) {
			this.selectedCollections.push(checkedCollection);
		} else {
			this.selectedCollections = this.selectedCollections.filter((collection) => {
				return collection.name !== checkedCollection.name;
			});
		}
	}

	applySorting() {
		const collectionSorter = (a: RecipientBadgeCollection, b: RecipientBadgeCollection) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();

			return aName === bName ? 0 : aName < bName ? -1 : 1;
		};
		(this.badgeCollectionsResults || []).sort(collectionSorter);
	}

	private updateResults() {
		this.badgeCollectionsResults.length = 0;

		const addCollectionToResults = (collection) => {
			// only display the collections not currently associated with badge.
			if (this.omittedCollection.collections.has(collection)) {
				return;
			}

			this.badgeCollectionsResults.push(collection);
		};

		this.badgeCollections
			.filter(MatchingAlgorithm.collectionMatcher(this.searchQuery))
			.forEach(addCollectionToResults);

		this.applySorting();
	}
}
