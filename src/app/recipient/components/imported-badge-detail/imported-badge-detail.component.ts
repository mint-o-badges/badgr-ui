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
import { CompetencyType, PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { TranslateService } from '@ngx-translate/core';
import { RecipientBadgeApiService } from '../../services/recipient-badges-api.service';
import { ApiImportedBadgeInstance } from '../../models/recipient-badge-api.model';
import { BgBadgeDetail } from '../../../common/components/badge-detail/badge-detail.component';

@Component({
	selector: 'recipient-earned-badge-detail',
	template: `<bg-badgedetail [config]="config" [awaitPromises]="[badgeLoaded]" [badge]="badge"></bg-badgedetail>`,
	imports: [BgBadgeDetail],
})
export class ImportedBadgeDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';

	@ViewChild('collectionSelectionDialog')
	collectionSelectionDialog: RecipientBadgeCollectionSelectionDialogComponent;

	badgesLoaded: Promise<unknown>;
	badgeLoaded: Promise<unknown>;
	learningPaths: ApiLearningPath[];
	learningPathsLoaded: Promise<ApiLearningPath[] | void>;
	badges: RecipientBadgeInstance[] = [];
	competencies: object[];
	category: object;
	badge: ApiImportedBadgeInstance;
	issuerBadgeCount: string;
	launchpoints: ApiExternalToolLaunchpoint[];

	config: PageConfig;

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
	// get recipientBadgeInstances() {
	// 	return this.recipientBadgeManager.recipientBadgeList;
	// }

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private recipientBadgeManager: RecipientBadgeManager,
		private learningPathApiService: LearningPathApiService,
		private title: Title,
		private messageService: MessageService,
		private eventService: EventsService,
		private dialogService: CommonDialogsService,
		private configService: AppConfigService,
		private externalToolsManager: ExternalToolsManager,
		public queryParametersService: QueryParametersService,
		private translate: TranslateService,
		private recipientBadgeApiService: RecipientBadgeApiService,
	) {
		super(router, route, loginService);

		this.badgeLoaded = this.recipientBadgeApiService.getImportedBadge(this.badgeSlug).then((r) => {
			this.badge = r;
			if ('extensions:CompetencyExtension' in this.badge.extensions) {
				var comps = this.badge.extensions['extensions:CompetencyExtension'] as Array<unknown> | Object;
                // In some old badges, the extension is not an array
                if (!comps['map'])
                    comps = [comps];
				this.competencies = comps['map']((c) => {
					return {
						name: c['name'] ?? c['extensions:name'],
						description: c['description'] ?? c['extensions:description'],
						studyLoad: c['studyLoad'] ?? c['extensions:studyLoad'],
						category: c['category'] ?? c['extensions:category'],
						framework: c['framework'] ?? c['extensions:framework'],
						framework_identifier: c['framework_identifier'] ?? c['extensions:framework_identifier'],
					};
				});
			}
			if ('extensions:CategoryExtension' in this.badge.extensions) {
				this.category = this.badge.extensions['extensions:CategoryExtension'] as object;
			}
			this.crumbs = [
				{ title: 'Mein Rucksack', routerLink: ['/recipient/badges'] },
				{ title: this.badge.json.badge.name, routerLink: ['/earned-badge/' + this.badge.id] },
			];
			this.config = {
				crumbs: this.crumbs,
				badgeTitle: this.badge.json.badge.name,
				// uncomment after the sharing of a badge is discussed from a data privacy perspective
				qrCodeButton: {
					show: false,
				},
				badgeCriteria: null,
				menuitems: [
					// {
					// 	title: 'Download JSON-Datei',
					// 	icon: '	lucideFileCode',
					// 	action: () => this.exportJson(),
					// },
					// {
					// 	title: 'Download PDF-Zertifikat',
					// 	icon: 'lucideFileText',
					// 	action: () => {},
					// },
					// {
					// 	title: 'Badge verifizieren',
					// 	icon: 'lucideBadgeCheck',
					// 	action: () => window.open(this.verifyUrl, '_blank'),
					// },
					{
						title: 'RecBadgeDetail.deleteBadge',
						icon: 'lucideTrash2',
						action: () => this.deleteBadge(this.badge),
					},
				],
				badgeDescription: this.badge.json.badge.description,
				issuerSlug: this.badge.json.badge.issuer.name,
				slug: this.badgeSlug,
				issuedOn: this.badge.json.issuedOn,
				issuedTo: this.badge.json.recipient.identity,
				category: this.category
					? this.translate.instant(
							`Badge.categories.${(this.category['Category'] ?? this.category['extensions:Category']) || 'participation'}`,
						)
					: null,
				tags: [],
				issuerName: this.badge.json.badge.issuer.name,
				issuerImagePlacholderUrl: this.issuerImagePlacholderUrl,
				issuerImage: this.badge.json.badge.issuer.image,
				badgeLoadingImageUrl: this.badgeLoadingImageUrl,
				badgeFailedImageUrl: this.badgeFailedImageUrl,
				badgeImage: this.badge.json.badge.image,
				learningPaths: [],
				competencies: this.competencies as CompetencyType[],
				// license: this.badge.getExtension('extensions:LicenseExtension', {}) ? true : false,
				// shareButton: true,
				// badgeInstanceSlug: this.badgeSlug,
			};
		});

		this.externalToolsManager.getToolLaunchpoints('earner_assertion_action').then((launchpoints) => {
			this.launchpoints = launchpoints;
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	// shareBadge() {
	// 	this.dialogService.shareSocialDialog.openDialog(badgeShareDialogOptionsFor(this.badge));
	// }

	deleteBadge(badge: ApiImportedBadgeInstance) {
		console.log(badge);
		this.dialogService.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: this.translate.instant('RecBadgeDetail.confirmRemove'),
				dialogBody: this.translate.instant('RecBadgeDetail.sureToRemove', {
					badgeName: badge.json.badge.name,
				}),
				rejectButtonLabel: this.translate.instant('General.cancel'),
				resolveButtonLabel: this.translate.instant('RecBadgeDetail.removeBadge'),
			})
			.then(
				() =>
					this.recipientBadgeApiService.deleteImportedBadge(badge.slug).then(
						() => {
							this.messageService.reportMajorSuccess(`${badge.json.badge.name} has been deleted`, true);
							this.router.navigate(['/recipient']);
						},
						(error) => {
							this.messageService.reportHandledError(`Failed to delete ${badge.json.badge.name}`, error);
						},
					),
				() => {},
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

	// get isExpired() {
	// 	return this.badge && this.badge.expiresDate && this.badge.expiresDate < new Date();
	// }

	// manageCollections() {
	// 	this.collectionSelectionDialog
	// 		.openDialog({
	// 			dialogId: 'recipient-badge-collec',
	// 			dialogTitle: 'Add to Collection(s)',
	// 			omittedCollection: this.badge,
	// 		})
	// 		.then((recipientBadgeCollection) => {
	// 			this.badge.collections.addAll(recipientBadgeCollection);
	// 			this.badge
	// 				.save()
	// 				.then((success) =>
	// 					this.messageService.reportMinorSuccess(
	// 						`Collection ${this.badge.badgeClass.name} badges saved successfully`,
	// 					),
	// 				)
	// 				.catch((failure) => this.messageService.reportHandledError(`Failed to save Collection`, failure));
	// 		});
	// }

	// removeCollection(collection: RecipientBadgeCollection) {
	// 	this.badge.collections.remove(collection);
	// 	this.badge
	// 		.save()
	// 		.then((success) =>
	// 			this.messageService.reportMinorSuccess(
	// 				`Collection removed successfully from ${this.badge.badgeClass.name}`,
	// 			),
	// 		)
	// 		.catch((failure) =>
	// 			this.messageService.reportHandledError(`Failed to remove Collection from badge`, failure),
	// 		);
	// }

	// private updateBadge(results) {
	// 	this.badge = results.entityForSlug(this.badgeSlug);
	// 	// tag test
	// 	// this.badge.badgeClass.tags = ['qwerty', 'boberty', 'BanannaFanna'];
	// 	this.badges = results.entities;
	// 	this.updateData();
	// }

	// private updateData() {
	// 	this.title.setTitle(
	// 		`Backpack - ${this.badge.badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
	// 	);

	// 	this.badge.markAccepted();

	// 	const issuerBadgeCount = () => {
	// 		const count = this.badges.filter((instance) => instance.issuerId === this.badge.issuerId).length;
	// 		return count === 1 ? '1 Badge' : `${count} Badges`;
	// 	};
	// 	this.issuerBadgeCount = issuerBadgeCount();
	// }

	private clickLaunchpoint(launchpoint: ApiExternalToolLaunchpoint) {
		this.externalToolsManager.getLaunchInfo(launchpoint, this.badgeSlug).then((launchInfo) => {
			this.eventService.externalToolLaunch.next(launchInfo);
		});
	}

	exportJson() {
		fetch(this.rawJsonUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const link = document.createElement('a');
				const url = URL.createObjectURL(blob);
				link.href = url;
				link.download = `${this.badge.json.issuedOn.toISOString().split('T')[0]}-${this.badge.json.badge.name.trim().replace(' ', '_')}.json`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			})
			.catch((error) => console.error('Download failed:', error));
	}

	// exportPdf() {
	// 	this.dialogService.exportPdfDialog.openDialog(this.badge).catch((error) => console.log(error));
	// }
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
		title: 'Badge Teilen',
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
