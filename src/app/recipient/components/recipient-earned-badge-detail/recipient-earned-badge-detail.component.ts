import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';

import { RecipientBadgeInstance } from '../../models/recipient-badge.model';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { RecipientBadgeCollectionSelectionDialogComponent } from '../recipient-badge-collection-selection-dialog/recipient-badge-collection-selection-dialog.component';
import { preloadImageURL } from '../../../common/util/file-util';
import { ShareSocialDialogOptions } from '../../../common/dialogs/share-social-dialog/share-social-dialog.component';
import { addQueryParamsToUrl } from '../../../common/util/url-util';
import { compareDate } from '../../../common/util/date-compare';
import { EventsService } from '../../../common/services/events.service';
import { AppConfigService } from '../../../common/app-config.service';
import { ApiExternalToolLaunchpoint } from '../../../externaltools/models/externaltools-api.model';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';
import { Issuer } from '../../../issuer/models/issuer.model';

@Component({
	selector: 'recipient-earned-badge-detail',
	templateUrl: './recipient-earned-badge-detail.component.html',
})
export class RecipientEarnedBadgeDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg'
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	@ViewChild('collectionSelectionDialog')
	collectionSelectionDialog: RecipientBadgeCollectionSelectionDialogComponent;

	badgesLoaded: Promise<unknown>;
	badges: RecipientBadgeInstance[] = [];
	badge: RecipientBadgeInstance;
	issuerBadgeCount: string;
	launchpoints: ApiExternalToolLaunchpoint[];

	now = new Date();
	compareDate = compareDate;
	tense = {
		expires: {
			'=-1': 'Expired',
			'=0': 'Expires',
			'=1': 'Expires',
		},
	};

	crumbs: LinkEntry[];

	get badgeSlug(): string {
		return this.route.snapshot.params['badgeSlug'];
	}
	get recipientBadgeInstances() {
		return this.recipientBadgeManager.recipientBadgeList;
	}

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private recipientBadgeManager: RecipientBadgeManager,
		private title: Title,
		private messageService: MessageService,
		private eventService: EventsService,
		private dialogService: CommonDialogsService,
		private configService: AppConfigService,
		private externalToolsManager: ExternalToolsManager,
		public queryParametersService: QueryParametersService
	) {
		super(router, route, loginService);

		this.badgesLoaded = this.recipientBadgeManager.recipientBadgeList.loadedPromise
			.then((r) => {
				this.updateBadge(r);
				this.crumbs = [
					{ title: 'Backpack', routerLink: ['/recipient/badges'] },
					{ title: this.badge.badgeClass.name, routerLink: ['/earned-badge/' + this.badge.slug] },
				];
			})
			.catch((e) => this.messageService.reportAndThrowError('Failed to load your badges', e));

		this.externalToolsManager.getToolLaunchpoints('earner_assertion_action').then((launchpoints) => {
			this.launchpoints = launchpoints;
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	shareBadge() {
		this.dialogService.shareSocialDialog.openDialog(badgeShareDialogOptionsFor(this.badge));
	}

	deleteBadge(badge: RecipientBadgeInstance) {
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Confirm Remove',
				dialogBody: `Are you sure you want to remove ${badge.badgeClass.name} from your badges?`,
				rejectButtonLabel: 'Cancel',
				resolveButtonLabel: 'Remove Badge',
			})
			.then(
				() =>
					this.recipientBadgeManager.deleteRecipientBadge(badge).then(
						() => {
							this.messageService.reportMajorSuccess(`${badge.badgeClass.name} has been deleted`, true);
							this.router.navigate(['/recipient']);
						},
						(error) => {
							this.messageService.reportHandledError(`Failed to delete ${badge.badgeClass.name}`, error);
						}
					),
				() => {}
			);
	}

	private get rawJsonUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.badgeSlug}.json`;
	}

	get rawBakedUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.badgeSlug}/baked`;
	}

	get verifyUrl() {
		let url = `${this.configService.assertionVerifyUrl}?url=${this.rawJsonUrl}`;

		for (const IDENTITY_TYPE of ['identity__email', 'identity__url', 'identity__telephone']) {
			const identity = this.queryParametersService.queryStringValue(IDENTITY_TYPE);
			if (identity) {
				url = `${url}&${IDENTITY_TYPE}=${identity}`;
			}
		}
		return url;
	}

	get isExpired() {
		return this.badge && this.badge.expiresDate && this.badge.expiresDate < new Date();
	}

	manageCollections() {
		this.collectionSelectionDialog
			.openDialog({
				dialogId: 'recipient-badge-collec',
				dialogTitle: 'Add to Collection(s)',
				omittedCollection: this.badge,
			})
			.then((recipientBadgeCollection) => {
				this.badge.collections.addAll(recipientBadgeCollection);
				this.badge
					.save()
					.then((success) =>
						this.messageService.reportMinorSuccess(
							`Collection ${this.badge.badgeClass.name} badges saved successfully`
						)
					)
					.catch((failure) => this.messageService.reportHandledError(`Failed to save Collection`, failure));
			});
	}

	removeCollection(collection: RecipientBadgeCollection) {
		this.badge.collections.remove(collection);
		this.badge
			.save()
			.then((success) =>
				this.messageService.reportMinorSuccess(
					`Collection removed successfully from ${this.badge.badgeClass.name}`
				)
			)
			.catch((failure) =>
				this.messageService.reportHandledError(`Failed to remove Collection from badge`, failure)
			);
	}

	private updateBadge(results) {
		this.badge = results.entityForSlug(this.badgeSlug);
		// tag test
		// this.badge.badgeClass.tags = ['qwerty', 'boberty', 'BanannaFanna'];
		this.badges = results.entities;
		this.updateData();
	}

	private updateData() {
		this.title.setTitle(
			`Backpack - ${this.badge.badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`
		);

		this.badge.markAccepted();

		const issuerBadgeCount = () => {
			const count = this.badges.filter((instance) => instance.issuerId === this.badge.issuerId).length;
			return count === 1 ? '1 Badge' : `${count} Badges`;
		};
		this.issuerBadgeCount = issuerBadgeCount();
	}

	private clickLaunchpoint(launchpoint: ApiExternalToolLaunchpoint) {
		this.externalToolsManager.getLaunchInfo(launchpoint, this.badgeSlug).then((launchInfo) => {
			this.eventService.externalToolLaunch.next(launchInfo);
		});
	}

	exportPdf() {
		let markdown = window.document.getElementById('recipient-earned-badge-detail-markdown-display') as HTMLElement;

		this.dialogService.exportPdfDialog.openDialog(this.badge, markdown).catch((error) => console.log(error));
	}
}

export function badgeShareDialogOptionsFor(badge: RecipientBadgeInstance): ShareSocialDialogOptions {
	return badgeShareDialogOptions({
		shareUrl: badge.shareUrl,
		imageUrl: badge.imagePreview,
		badgeClassName: badge.badgeClass.name,
		badgeClassDescription: badge.badgeClass.description,
		issueDate: badge.issueDate,
		recipientName: badge.getExtension('extensions:recipientProfile', { name: undefined }).name,
		recipientIdentifier: badge.recipientEmail,
		badge,
	});
}

interface BadgeShareOptions {
	shareUrl: string;
	imageUrl: string;
	badgeClassName: string;
	badgeClassDescription: string;
	issueDate: Date;
	recipientName?: string;
	recipientIdentifier?: string;
	recipientType?: string;

	badge: RecipientBadgeInstance | BadgeInstance;
}

export function badgeShareDialogOptions(options: BadgeShareOptions): ShareSocialDialogOptions {
	return {
		title: 'SHARE BADGE',
		shareObjectType: 'BadgeInstance',
		shareUrl: options.shareUrl,
		shareTitle: options.badgeClassName,
		imageUrl: options.imageUrl,
		// shareIdUrl: badge.url,
		shareIdUrl: options.shareUrl,
		shareSummary: options.badgeClassDescription,
		shareEndpoint: 'certification',

		showRecipientOptions: true,
		recipientIdentifier: options.recipientIdentifier,
		recipientType: options.recipientType,

		badge: options.badge,

		embedOptions: [
			{
				label: 'Card',
				embedTitle: 'Badge: ' + options.badgeClassName,
				embedType: 'iframe',
				embedSize: { width: 330, height: 186 },
				embedVersion: 1,
				// The UI will show the embedded version because of the embedding params that are included automatically by the dialog
				embedUrl: options.shareUrl,
				embedLinkUrl: null,
			},

			{
				label: 'Badge',
				embedTitle: 'Badge: ' + options.badgeClassName,
				embedType: 'image',
				embedSize: { width: 128, height: 128 },
				embedVersion: 1,
				embedUrl: options.imageUrl,
				embedLinkUrl: options.shareUrl,
				embedAwardDate: options.issueDate,
				embedBadgeName: options.badgeClassName,
				embedRecipientName: options.recipientName,
			},
		],
	};
}
