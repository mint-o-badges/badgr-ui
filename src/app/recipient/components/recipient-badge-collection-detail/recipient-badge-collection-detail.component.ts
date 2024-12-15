import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { RecipientBadgeSelectionDialog } from '../recipient-badge-selection-dialog/recipient-badge-selection-dialog.component';
import { RecipientBadgeCollection, RecipientBadgeCollectionEntry } from '../../models/recipient-badge-collection.model';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { ShareSocialDialogOptions } from '../../../common/dialogs/share-social-dialog/share-social-dialog.component';
import { addQueryParamsToUrl } from '../../../common/util/url-util';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';

@Component({
    selector: 'recipient-earned-badge-detail',
    templateUrl: 'recipient-badge-collection-detail.component.html',
    standalone: false
})
export class RecipientBadgeCollectionDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';
	readonly noBadgesImageUrl = '../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-backpack.svg';
	readonly noCollectionsImageUrl =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-collection.svg';

	@ViewChild('recipientBadgeDialog')
	recipientBadgeDialog: RecipientBadgeSelectionDialog;

	collectionLoadedPromise: Promise<unknown>;
	collection: RecipientBadgeCollection = new RecipientBadgeCollection(null);
	crumbs: LinkEntry[];

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private title: Title,
		private messageService: MessageService,
		private recipientBadgeManager: RecipientBadgeManager,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager,
		private configService: AppConfigService,
		private dialogService: CommonDialogsService,
	) {
		super(router, route, loginService);

		title.setTitle(`Collections - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		this.collectionLoadedPromise = Promise.all([
			this.recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise,
			this.recipientBadgeManager.recipientBadgeList.loadedPromise,
		])
			.then(([list]) => {
				this.collection = list.entityForSlug(this.collectionSlug);
				this.crumbs = [
					{ title: 'Collections', routerLink: ['/recipient/badge-collections'] },
					{ title: this.collection.name, routerLink: ['/collection/' + this.collection.slug] },
				];
				return this.collection;
			})
			.then((collection) => collection.badgesPromise)
			.catch((err) => {
				router.navigate(['/']);
				return this.messageService.reportHandledError(`Failed to load collection ${this.collectionSlug}`);
			});
	}

	get collectionSlug(): string {
		return this.route.snapshot.params['collectionSlug'];
	}

	ngOnInit() {
		super.ngOnInit();
	}

	manageBadges() {
		this.recipientBadgeDialog
			.openDialog({
				dialogId: 'manage-collection-badges',
				dialogTitle: 'Add Badges',
				multiSelectMode: true,
				restrictToIssuerId: null,
				omittedCollection: this.collection.badges,
			})
			.then((selectedBadges) => {
				const badgeCollection = selectedBadges.concat(this.collection.badges);

				badgeCollection.forEach((badge) => badge.markAccepted());

				this.collection.updateBadges(badgeCollection);
				this.collection.save().then(
					(success) =>
						this.messageService.reportMinorSuccess(
							`Collection ${this.collection.name} badges saved successfully`,
						),
					(failure) => this.messageService.reportHandledError(`Failed to save Collection`, failure),
				);
			});
	}

	deleteCollection() {
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Delete Collection',
				dialogBody: `Are you sure you want to delete collection ${this.collection.name}?`,
				resolveButtonLabel: 'Delete Collection',
				rejectButtonLabel: 'Cancel',
			})
			.then(
				() => {
					this.collection.deleteCollection().then(
						() => {
							this.messageService.reportMinorSuccess(`Deleted collection '${this.collection.name}'`);
							this.router.navigate(['/recipient/badge-collections']);
						},
						(error) => this.messageService.reportHandledError(`Failed to delete collection`, error),
					);
				},
				() => {},
			);
	}

	removeEntry(entry: RecipientBadgeCollectionEntry) {
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Confirm Remove',
				dialogBody: `Are you sure you want to remove ${entry.badge.badgeClass.name} from ${this.collection.name}?`,
				rejectButtonLabel: 'Cancel',
				resolveButtonLabel: 'Remove Badge',
			})
			.then(
				() => {
					this.collection.badgeEntries.remove(entry);
					this.collection.save().then(
						(success) =>
							this.messageService.reportMinorSuccess(
								`Removed badge ${entry.badge.badgeClass.name} from collection ${this.collection.name} successfully`,
							),
						(failure) =>
							this.messageService.reportHandledError(
								`Failed to remove badge ${entry.badge.badgeClass.name} from collection ${this.collection.name}`,
								failure,
							),
					);
				},
				() => {},
			);
	}

	get badgesInCollectionCount(): string {
		return `${this.collection.badgeEntries.length} ${
			this.collection.badgeEntries.length === 1 ? 'Badge' : 'Badges'
		}`;
	}

	get collectionPublished() {
		return this.collection.published;
	}

	set collectionPublished(published: boolean) {
		this.collection.published = published;

		if (published) {
			this.collection.save().then(
				(success) =>
					this.messageService.reportMinorSuccess(`Published collection ${this.collection.name} successfully`),
				(failure) =>
					this.messageService.reportHandledError(
						`Failed to publish collection ${this.collection.name}`,
						failure,
					),
			);
		} else {
			this.collection.save().then(
				(success) =>
					this.messageService.reportMinorSuccess(
						`Unpublished collection ${this.collection.name} successfully`,
					),
				(failure) =>
					this.messageService.reportHandledError(
						`Failed to un-publish collection ${this.collection.name}`,
						failure,
					),
			);
		}
	}

	shareCollection() {
		this.dialogService.shareSocialDialog.openDialog(shareCollectionDialogOptionsFor(this.collection));
	}

	// exportPdf() {
	// 	this.dialogService.exportPdfDialog.openDialogForCollections(this.collection)
	// 		.catch((error) => console.log(error));
	// }
}

export function shareCollectionDialogOptionsFor(collection: RecipientBadgeCollection): ShareSocialDialogOptions {
	return {
		title: 'Share Collection',
		shareObjectType: 'BadgeCollection',
		shareUrl: collection.shareUrl,
		shareTitle: collection.name,
		shareIdUrl: collection.url,
		shareSummary: collection.description,
		shareEndpoint: 'shareArticle',
		excludeServiceTypes: ['Pinterest'],

		embedOptions: [
			{
				label: 'Card',
				embedTitle: /*"Badge Collection: " +*/ collection.name,
				embedType: 'iframe',
				embedSize: { width: 330, height: 186 },
				embedVersion: 1,
				embedUrl: addQueryParamsToUrl(collection.shareUrl, { embed: true }),
				embedLinkUrl: null,
			},
		],
	};
}
