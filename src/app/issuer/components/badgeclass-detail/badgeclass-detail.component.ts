import { Component, OnInit, SecurityContext } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { Issuer } from '../../models/issuer.model';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
import { StringMatchingUtil } from '../../../common/util/string-matching-util';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { BadgeClassInstances, BadgeInstance } from '../../models/badgeinstance.model';

import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgrApiFailure } from '../../../common/services/api-failure';
import { preloadImageURL } from '../../../common/util/file-util';
import { EventsService } from '../../../common/services/events.service';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { ApiExternalToolLaunchpoint } from '../../../externaltools/models/externaltools-api.model';
import { BadgeInstanceSlug } from '../../models/badgeinstance-api.model';
import { badgeShareDialogOptions } from '../../../recipient/components/recipient-earned-badge-detail/recipient-earned-badge-detail.component';
import { ShareSocialDialogOptions } from '../../../common/dialogs/share-social-dialog/share-social-dialog.component';
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassCategory, BadgeClassLevel } from '../../models/badgeclass-api.model';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { PdfService } from '../../../common/services/pdf.service';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { InfoDialogComponent } from '../../../common/dialogs/oeb-dialogs/info-dialog.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { inject } from '@angular/core';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';

@Component({
	selector: 'badgeclass-detail',
	template: `
		<bg-badgedetail [config]="config" [awaitPromises]="[issuerLoaded, badgeClassLoaded]">
			<qrcode-awards
				*ngIf="config.qrCodeButton.show"
				(qrBadgeAward)="onQrBadgeAward()"
				[awards]="qrCodeAwards"
				[badgeClass]="badgeClass"
				[issuer]="issuer"
				[routerLinkText]="config?.issueQrRouterLink"
			></qrcode-awards>
			<issuer-detail-datatable
				[recipientCount]="recipientCount"
				[_recipients]="instanceResults"
				(actionElement)="revokeInstance($event)"
				(downloadCertificate)="downloadCertificate($event.instance, $event.badgeIndex)"
				[downloadStates]="downloadStates"
			></issuer-detail-datatable>
		</bg-badgedetail>
	`,
	standalone: false,
})
export class BadgeClassDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get confirmDialog() {
		return this.dialogService.confirmDialog;
	}

	get recipientCount() {
		return this.badgeClass ? this.badgeClass.recipientCount : null;
	}

	set recipientCount(value: number) {
		this.badgeClass.recipientCount = value;
	}

	get activeRecipientCount() {
		const badges = this.allBadgeInstances.entities.filter(
			(thisEntity) => !thisEntity.isExpired && !thisEntity.isRevoked,
		);
		return badges && badges.length;
	}

	get issuerBadgeCount() {
		// Load the list if it's not present
		// this.badgeManager.badgesByIssuerUrl.loadedPromise;

		const badges = this.badgeManager.badgesByIssuerUrl.lookup(this.issuer.issuerUrl);
		return badges && badges.length;
	}
	readonly issuerImagePlacholderUrl = preloadImageURL(
		'../../../../breakdown/static/images/placeholderavatar-issuer.svg',
	);
	launchpoints: ApiExternalToolLaunchpoint[];

	private readonly _hlmDialogService = inject(HlmDialogService);

	badgeClassLoaded: Promise<unknown>;
	badgeInstancesLoaded: Promise<unknown>;
	assertionsLoaded: Promise<unknown>;
	issuerLoaded: Promise<unknown>;
	learningPaths: ApiLearningPath[];
	showAssertionCount = false;
	badgeClass: BadgeClass;
	allBadgeInstances: BadgeClassInstances;
	instanceResults: BadgeInstance[] = [];
	popInstance: BadgeInstance | null = null;
	resultsPerPage = 100;
	issuer: Issuer;
	crumbs: LinkEntry[];

	config: PageConfig;

	qrCodeButtonText = 'Badge über QR-Code vergeben';
	qrCodeAwards = [];

	pdfSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
	downloadStates: boolean[] = [false];

	categoryOptions: { [key in BadgeClassCategory]: string } = {
		competency: 'Kompetenz-Badge',
		participation: 'Teilnahme-Badge',
		learningpath: 'Micro Degree',
	};

	levelOptions: { [key in BadgeClassLevel]: string } = {
		a1: 'A1 Einsteiger*in',
		a2: 'A2 Entdecker*in',
		b1: 'B1 Insider*in',
		b2: 'B2 Expert*in',
		c1: 'C1 Leader*in',
		c2: 'C2 Vorreiter*in',
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager,
		protected issuerManager: IssuerManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected qrCodeApiService: QrCodeApiService,
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected dialogService: CommonDialogsService,
		private eventService: EventsService,
		protected configService: AppConfigService,
		private externalToolsManager: ExternalToolsManager,
		protected pdfService: PdfService,
		private sanitizer: DomSanitizer,
		private translate: TranslateService,
		private learningPathApiService: LearningPathApiService,
	) {
		super(router, route, sessionService);

		this.badgeClassLoaded = badgeManager.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug).then(
			(badge) => {
				this.badgeClass = badge;
				this.title.setTitle(
					`Badge Class - ${this.badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
				this.loadInstances();
			},
			(error) =>
				this.messageService.reportLoadingError(
					`Cannot find badge ${this.issuerSlug} / ${this.badgeSlug}`,
					error,
				),
		);

		this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => (this.issuer = issuer),
			(error) => this.messageService.reportLoadingError(`Cannot find issuer ${this.issuerSlug}`, error),
		);

		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuerSlug, this.badgeSlug).then((qrCodes) => {
			this.qrCodeAwards = qrCodes;
		});

		this.externalToolsManager.getToolLaunchpoints('issuer_assertion_action').then((launchpoints) => {
			this.launchpoints = launchpoints;
		});
	}

	async loadInstances(recipientQuery?: string) {
		const instances = new BadgeClassInstances(
			this.badgeInstanceManager,
			this.issuerSlug,
			this.badgeSlug,
			recipientQuery,
		);
		this.learningPaths = await this.learningPathApiService.getLearningPathsForBadgeClass(this.badgeSlug);
		this.badgeInstancesLoaded = instances.loadedPromise.then(
			(retInstances) => {
				this.crumbs = [
					{ title: 'Meine Institutionen', routerLink: ['/issuer/issuers'] },
					{ title: this.issuer.name, routerLink: ['/issuer/issuers/' + this.issuerSlug] },
					{
						title: this.badgeClass.name,
						routerLink: ['/issuer/issuers/' + this.issuerSlug + '/badges/' + this.badgeSlug],
					},
				];
				this.allBadgeInstances = retInstances;
				this.updateResults();
				this.config = {
					crumbs: this.crumbs,
					badgeTitle: this.badgeClass.name,
					headerButton: {
						title: 'Badge direkt vergeben',
						action: () => this.routeToBadgeAward(this.badgeClass, this.issuer),
						// routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'issue'],
					},
					issueQrRouterLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr'],
					qrCodeButton: {
						title: 'Badge über QR-Code vergeben',
						show: true,
						action: () => this.routeToQRCodeAward(this.badgeClass, this.issuer),
					},
					menuitems: [
						{
							title: 'Bearbeiten',
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'edit'],
							disabled: this.badgeClass.recipientCount > 0,
							icon: 'lucidePencil',
						},
						{
							title: 'Kopieren (diese Institution)',
							action: () => { this.router.navigate(['/issuer/issuers', this.issuer.slug, 'badges', 'create'], { state: { 'copybadgeid' : this.badgeSlug } }); },
							icon: 'lucideCopy',
						},
						{
							title: 'Kopierstatus bearbeiten',
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'copypermissions'],
							icon: 'lucideCopyX',
						},
						{
							title: 'Löschen',
							icon: 'lucideTrash2',
							action: () => this.deleteBadge(),
						},
					],
					badgeDescription: this.badgeClass.description,
					issuerSlug: this.issuerSlug,
					slug: this.badgeSlug,
					createdAt: this.badgeClass.createdAt,
					updatedAt: this.badgeClass.updatedAt,
					duration: this.badgeClass.extension['extensions:StudyLoadExtension'].StudyLoad,
					category: this.translate.instant(
						`Badge.categories.${this.badgeClass.extension['extensions:CategoryExtension']?.Category || 'participation'}`,
					),
					tags: this.badgeClass.tags,
					issuerName: this.badgeClass.issuerName,
					issuerImagePlacholderUrl: this.issuerImagePlacholderUrl,
					issuerImage: this.issuer.image,
					badgeLoadingImageUrl: this.badgeLoadingImageUrl,
					badgeFailedImageUrl: this.badgeFailedImageUrl,
					badgeImage: this.badgeClass.image,
					competencies: this.badgeClass.extension['extensions:CompetencyExtension'],
					license: this.badgeClass.extension['extensions:LicenseExtension'] ? true : false,
					learningPaths: this.learningPaths,
				};
				if (this.badgeClass.extension['extensions:CategoryExtension']?.Category === 'learningpath') {
					this.config.headerButton = null;
					this.config.qrCodeButton.show = false;
				}
			},
			(error) => {
				this.messageService.reportLoadingError(
					`Could not load recipients ${this.issuerSlug} / ${this.badgeSlug}`,
				);
				return error;
			},
		);
	}

	onQrBadgeAward() {
		this.loadInstances();
		this.recipientCount += 1;
	}

	ngOnInit() {
		super.ngOnInit();
	}

	revokeInstance(instance: BadgeInstance) {
		this.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: 'Warnung',
				dialogBody: `Bist du sicher, dass du <strong>${this.badgeClass.name}</strong> von <strong>${instance.recipientIdentifier}</strong> zurücknehmen möchtest?`,
				resolveButtonLabel: 'Zurücknehmen',
				rejectButtonLabel: 'Abbrechen',
			})
			.then(
				() => {
					instance.revokeBadgeInstance('Manually revoked by Issuer').then(
						(result) => {
							this.messageService.reportMinorSuccess(
								`Badge von ${instance.recipientIdentifier} zurücknehmen`,
							);
							this.badgeClass.update();
							// this.updateResults();
							// reload instances to refresh datatable
							this.loadInstances();
						},
						(error) =>
							this.messageService.reportAndThrowError(
								`Widerrufen des Badges von ${instance.recipientIdentifier} fehlgeschlagen`,
							),
					);
				},
				() => void 0, // Cancel
			);
	}

	// To get and download badge certificate in pdf format
	downloadCertificate(instance: BadgeInstance, badgeIndex: number) {
		this.downloadStates[badgeIndex] = true;
		this.pdfService
			.getPdf(instance.slug)
			.then((url) => {
				this.pdfSrc = url;
				this.pdfService.downloadPdf(this.pdfSrc, this.badgeClass.name, instance.createdAt);
				this.downloadStates[badgeIndex] = false;
			})
			.catch((error) => {
				this.downloadStates[badgeIndex] = false;
				console.log(error);
			});
	}

	deleteBadge() {
		if (this.activeRecipientCount === 0) {
			this.confirmDialog
				.openResolveRejectDialog({
					dialogTitle: this.translate.instant('General.warning'),
					dialogBody:
						this.translate.instant('Badge.deletePart1') +
						`<strong>${this.badgeClass.name}</strong>` +
						this.translate.instant('Badge.deletePart2'),
					resolveButtonLabel: this.translate.instant('Badge.deleteConfirm'),
					rejectButtonLabel: this.translate.instant('General.cancel'),
				})
				.then(
					() => {
						this.badgeManager.removeBadgeClass(this.badgeClass).then(
							(success) => {
								this.messageService.reportMajorSuccess(`Removed badge class: ${this.badgeClass.name}.`);
								this.router.navigate(['issuer/issuers', this.issuerSlug]);
							},
							(error) => {
								this.messageService.reportAndThrowError(
									`Failed to delete badge class: ${BadgrApiFailure.from(error).firstMessage}`,
								);
							},
						);
					},
					() => void 0,
				);
		} else {
			this.confirmDialog
				.openResolveRejectDialog({
					dialogTitle: 'Error',
					dialogBody: `All instances of <strong>${this.badgeClass.name}</strong> must be revoked before you can delete it`,
					resolveButtonLabel: 'Ok',
					showRejectButton: false,
				})
				.then(
					() => void 0,
					() => void 0,
				);
		}
	}

	routeToBadgeAward(badge: BadgeClass, issuer) {
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if (badge.recipientCount === 0 && qrCodes.length === 0) {
				const dialogRef = this._hlmDialogService.open(InfoDialogComponent, {
					context: {
						variant: 'info',
						caption: this.translate.instant('Badge.endOfEditDialogTitle'),
						subtitle: this.translate.instant('Badge.endOfEditDialogText'),
						text: this.translate.instant('Badge.endOfEditDialogSubText'),
						cancelText: this.translate.instant('General.cancel'),
						forwardText: this.translate.instant('Issuer.giveBadge'),
					},
				});
				dialogRef.closed$.subscribe((result) => {
					if (result === 'continue')
						this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
				});
			} else {
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
			}
		});
	}

	routeToQRCodeAward(badge, issuer) {
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if (badge.recipientCount === 0 && qrCodes.length === 0) {
				const dialogRef = this._hlmDialogService.open(InfoDialogComponent, {
					context: {
						variant: 'info',
						caption: this.translate.instant('Badge.endOfEditDialogTitle'),
						subtitle: this.translate.instant('Badge.endOfEditDialogTextQR'),
						text: this.translate.instant('Badge.endOfEditDialogSubText'),
						cancelText: this.translate.instant('General.previous'),
						forwardText: this.translate.instant('Issuer.giveQr'),
					},
				});
				dialogRef.closed$.subscribe((result) => {
					if (result === 'continue')
						this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
				});
			} else {
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
			}
		});
	}

	shareInstance(instance: BadgeInstance) {
		this.dialogService.shareSocialDialog.openDialog(this.badgeShareDialogOptionsFor(instance));
	}

	badgeShareDialogOptionsFor(badge: BadgeInstance): ShareSocialDialogOptions {
		return badgeShareDialogOptions({
			shareUrl: badge.instanceUrl,
			imageUrl: badge.imagePreview,
			badgeClassName: this.badgeClass.name,
			badgeClassDescription: this.badgeClass.description,
			issueDate: badge.issuedOn,
			recipientName: badge.getExtension('extensions:recipientProfile', { name: undefined }).name,
			recipientIdentifier: badge.recipientIdentifier,
			recipientType: badge.recipientType,
			badge,
		});
	}

	private updateResults() {
		this.instanceResults = this.allBadgeInstances.entities;
		if (this.recipientCount > this.resultsPerPage) {
			this.showAssertionCount = true;
		}
	}

	private hasNextPage() {
		return this.allBadgeInstances.lastPaginationResult && this.allBadgeInstances.lastPaginationResult.nextUrl;
	}
	private hasPrevPage() {
		return this.allBadgeInstances.lastPaginationResult && this.allBadgeInstances.lastPaginationResult.prevUrl;
	}

	private clickNextPage() {
		if (this.hasNextPage()) {
			this.showAssertionCount = false;
			this.assertionsLoaded = this.allBadgeInstances.loadNextPage().then(() => (this.showAssertionCount = true));
		}
	}

	private clickPrevPage() {
		if (this.hasPrevPage()) {
			this.showAssertionCount = false;
			this.assertionsLoaded = this.allBadgeInstances.loadPrevPage().then(() => (this.showAssertionCount = true));
		}
	}

	private clickLaunchpoint(launchpoint: ApiExternalToolLaunchpoint, instanceSlug: BadgeInstanceSlug) {
		this.externalToolsManager.getLaunchInfo(launchpoint, instanceSlug).then((launchInfo) => {
			this.eventService.externalToolLaunch.next(launchInfo);
		});
	}
}

class MatchingAlgorithm {
	static instanceMatcher(inputPattern: string): (instance: BadgeInstance) => boolean {
		const patternStr = StringMatchingUtil.normalizeString(inputPattern);
		const patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return (instance) => StringMatchingUtil.stringMatches(instance.recipientIdentifier, patternStr, patternExp);
	}
}
