import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { MessageService } from '../../../common/services/message.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BaseDialog } from '../../../common/dialogs/base-dialog';
import { BadgeClass } from '../../models/badgeclass.model';

export interface CollectionBadgeSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;
	multiSelectMode: boolean;
}

@Component({
	selector: 'collectionbadge-selection-dialog',
	templateUrl: './collectionbadge-selection-dialog.component.html',
})
export class CollectionBadgeSelectionDialog extends BaseDialog {
	@Input() badgeClasses: BadgeClass[];

	dialogId = 'CollectionBadgeDialog';
	dialogTitle = 'Select Badges';

	multiSelectMode = true;
	selectedBadges = new Set<BadgeClass>();

	maxDisplayedResults = 100;
	badgeResults: BadgeClass[] = [];

	allBadges: BadgeClass[];
	badgesLoaded: Promise<unknown>;

	private resolveFunc: { (badges: BadgeClass[]): void };

	private loadedData = false;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private badgeManager: BadgeClassManager,
		private messageService: MessageService,
	) {
		super(componentElem, renderer);
	}

	openDialog({
		dialogId,
		dialogTitle,
		multiSelectMode,
	}: CollectionBadgeSelectionDialogOptions): Promise<BadgeClass[]> {
		this.showModal();
		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.multiSelectMode = multiSelectMode;
		this.selectedBadges.clear();

		this.updateData();

		return new Promise<BadgeClass[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(Array.from(this.selectedBadges.values()));
	}

	updateBadgeSelection(badgeClass: BadgeClass, select: boolean) {
		if (select) {
			this.selectedBadges.add(badgeClass);
		} else {
			this.selectedBadges.delete(badgeClass);
		}
	}

	private updateData() {
		this.badgesLoaded = this.badgeManager.allBadgesList.loadedPromise.then(
			(list) => this.updateBadges(list.entities),
			(err) => this.messageService.reportAndThrowError('Failed to load badge list', err),
		);
	}

	private updateBadges(allBadges: BadgeClass[]) {
		this.loadedData = true;
		this.allBadges = allBadges;
	}
}
