import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../common/services/message.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeClass } from '../../models/badgeclass.model';
import { Issuer } from '../../models/issuer.model';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { SessionService } from '../../../common/services/session.service';
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
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { PdfService } from '../../../common/services/pdf.service';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { InfoDialogComponent } from '../../../common/dialogs/oeb-dialogs/info-dialog.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { inject } from '@angular/core';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { TaskResult, TaskStatus, TaskPollingManagerService } from '../../../common/task-manager.service';
import { Subscription } from 'rxjs';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { BgBadgeDetail } from '../../../common/components/badge-detail/badge-detail.component';
import { QrCodeAwardsComponent } from '../qrcode-awards/qrcode-awards.component';
import { IssuerDetailDatatableComponent } from '../../../components/datatable-issuer-detail.component';
import { FormsModule } from '@angular/forms';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmH2 } from '@spartan-ng/helm/typography';
import { OebTabsComponent } from '~/components/oeb-backpack-tabs.component';

@Component({
	selector: 'badgeclass-detail',
	template: `
		<bg-badgedetail [config]="config" [awaitPromises]="[issuerLoaded, badgeClassLoaded]">
			<oeb-backpack-tabs
				[variant]="'black'"
				(onTabChanged)="onTabChange($event)"
				[activeTab]="activeTab"
				[tabs]="tabs"
			>
			</oeb-backpack-tabs>
			<ng-template #qrAwards>
				<qrcode-awards
					(qrBadgeAward)="onQrBadgeAward($event)"
					[awards]="qrCodeAwards"
					[badgeClass]="badgeClass"
					[issuer]="issuer"
					[routerLinkText]="config?.issueQrRouterLink"
					[defaultUnfolded]="focusRequests"
				></qrcode-awards>
			</ng-template>
			<ng-template #batchAwards>
				<issuer-detail-datatable
					[recipientCount]="recipientCount"
					[recipients]="instanceResults"
					(actionElement)="revokeInstance($event)"
					(downloadCertificate)="downloadCertificate($event['instance'], $event['badgeIndex'])"
					[downloadStates]="downloadStates"
					[awardInProgress]="isTaskProcessing || isTaskPending"
				></issuer-detail-datatable>
			</ng-template>
			<ng-template #headerTemplate>
				<h2 class="tw-font-bold tw-my-2" hlmH2>{{ 'Badge.copyForWhatInstitution' | translate }}</h2>
			</ng-template>
			<ng-template #issuerSelection>
				<div class="tw-mb-8">
					@if (config.copy_permissions.includes('others')) {
						@for (issuer of userIssuers; track issuer) {
							<label class="radio tw-mb-2">
								<input type="radio" [(ngModel)]="selectedIssuer" [value]="issuer" />
								<span class="radio-x-text">{{ issuer.name }}</span>
							</label>
						}
					} @else {
						<span class="tw-text-oebblack tw-text-center tw-my-2">
							{{ 'Badge.copyPermissionInfo' | translate }}
						</span>
						<label class="radio tw-my-2">
							<input type="radio" [(ngModel)]="selectedIssuer" [value]="issuer" />
							<span class="radio-x-text">{{ config.issuerName }}</span>
						</label>
					}
				</div>
				<oeb-button
					width="full_width"
					type="button"
					[disabled]="!selectedIssuer"
					(click)="routeToBadgeCreation(selectedIssuer)"
					size="sm"
					[text]="'General.next' | translate"
				>
				</oeb-button>
			</ng-template>
		</bg-badgedetail>
	`,
	imports: [
		BgBadgeDetail,
		QrCodeAwardsComponent,
		IssuerDetailDatatableComponent,
		HlmH2,
		FormsModule,
		OebButtonComponent,
		TranslatePipe,
		OebTabsComponent,
	],
})
export class BadgeClassDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	@ViewChild('qrAwards') qrAwards!: ElementRef;
	@ViewChild('batchAwards') batchAwards!: ElementRef;

	@ViewChild('issuerSelection')
	issuerSelection: TemplateRef<void>;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	readonly badgeFailedImageUrl = '../../../../breakdown/static/images/badge-failed.svg';
	readonly badgeLoadingImageUrl = '../../../../breakdown/static/images/badge-loading.svg';

	currentTaskStatus: TaskResult | null = null;
	isTaskActive: boolean = false;

	private taskSubscription: Subscription | null = null;

	TaskStatus = TaskStatus;

	tabs: any = undefined;
	activeTab = 'qrcodes';

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

	private statusSubscription: Subscription | null = null;

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
	focusRequests: boolean;
	hasScrolled: boolean = false;
	userIssuers: Issuer[] = [];
	dialogRef: BrnDialogRef<unknown> = null;
	selectedIssuer: Issuer = null;

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
		private taskService: TaskPollingManagerService,
		protected userProfileManager: UserProfileManager,
	) {
		super(router, route, sessionService);

		this.badgeClassLoaded = badgeManager.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug).then(
			(badge) => {
				this.badgeClass = badge;
				this.title.setTitle(
					`Badge Class - ${this.badgeClass.name} - ${this.configService.theme['serviceName'] || 'Badgr'}`,
				);
				// wait for user profile, emails, issuer to check if user can copy
				this.userProfileManager.userProfilePromise.then((profile) => {
					profile.emails.loadedPromise.then(() => {
						this.issuerManager.myIssuers$.subscribe((issuers) => {
							this.userIssuers = issuers.filter((issuer) => issuer.canCreateBadge);
						});
					});
				});
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

		Promise.all([this.issuerLoaded, this.badgeClassLoaded])
			.then(() => {
				this.loadInstances();
			})
			.catch((error) => {
				console.error('Error loading instances:', error);
			});
	}

	ngAfterViewChecked() {
		this.focusRequestsOnPage();
		this.focusBatchAwardingsOnPage();
	}

	ngAfterViewInit() {
		this.tabs = [
			{
				key: 'qrcodes',
				title: 'Qrcodes',
				component: this.qrAwards,
			},
			{
				key: 'recipients',
				title: 'Recipients',
				component: this.batchAwards,
			},
		];
	}

	copyBadge() {
		if (this.userIssuers.length == 1) {
			// copy
			this.router.navigate(['/issuer/issuers', this.userIssuers[0].slug, 'badges', 'create'], {
				state: { copybadgeid: this.badgeClass.slug },
			});
		} else if (this.userIssuers.length > 1) {
			const dialogRef = this._hlmDialogService.open(DialogComponent, {
				context: {
					headerTemplate: this.headerTemplate,
					content: this.issuerSelection,
				},
			});

			this.dialogRef = dialogRef;
		}
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	routeToBadgeCreation(issuer: Issuer) {
		this.closeDialog();
		this.router.navigate(['/issuer/issuers', issuer.slug, 'badges', 'create'], {
			state: { copybadgeid: this.badgeClass.slug },
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
					badgeCriteria: this.badgeClass.apiModel.criteria,
					headerButton: {
						title: 'Badge.award',
						action: () => this.routeToBadgeAward(this.badgeClass, this.issuer),
						// routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'issue'],
					},
					issueQrRouterLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr'],
					qrCodeButton: {
						title: 'Badge.awardQRCode',
						show: true,
						action: () => this.routeToQRCodeAward(this.badgeClass, this.issuer),
					},
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
					copy_permissions: this.badgeClass.copyPermissions,
					menuitems: [
						{
							title: 'General.edit',
							routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'edit'],
							disabled:
								this.badgeClass.recipientCount > 0 ||
								!this.issuer.canEditBadge ||
								this.qrCodeAwards.length > 0,
							icon: 'lucidePencil',
						},
						{
							title: this.badgeClass.copyPermissions.includes('others')
								? 'General.copy'
								: 'Badge.copyThisIssuer',
							action: this.copyBadge.bind(this),
							icon: 'lucideCopy',
							disabled: !this.issuer.canCreateBadge,
						},
						{
							title: 'Badge.editCopyStatus',
							routerLink: [
								'/issuer/issuers',
								this.issuerSlug,
								'badges',
								this.badgeSlug,
								'copypermissions',
							],
							icon: 'lucideCopyX',
							disabled: !this.issuer.canEditBadge,
						},
						{
							title: 'General.delete',
							icon: 'lucideTrash2',
							action: () => this.deleteBadge(),
							disabled: !this.issuer.canDeleteBadge,
						},
					],
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

	onQrBadgeAward(event: number) {
		this.loadInstances();
		this.recipientCount += event;
	}

	ngOnInit() {
		super.ngOnInit();
		this.checkForActiveTask();
		this.focusRequests = this.route.snapshot.queryParamMap.get('focusRequests') === 'true';
	}

	ngOnDestroy() {
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}
	}

	private checkForActiveTask() {
		if (this.taskService.hasActiveTask(this.badgeSlug)) {
			this.isTaskActive = true;

			this.currentTaskStatus = this.taskService.getLastTaskStatus(this.badgeSlug);
			this.focusBatchAwardingsOnPage();

			this.subscribeToTaskUpdates();
		}
	}

	private subscribeToTaskUpdates() {
		this.taskSubscription = this.taskService.getTaskUpdatesForBadge(this.badgeSlug).subscribe(
			(taskResult: TaskResult) => {
				this.currentTaskStatus = taskResult;

				if (taskResult.status === TaskStatus.SUCCESS) {
					this.handleTaskSuccess(taskResult);
				} else if (taskResult.status === TaskStatus.FAILURE) {
					this.handleTaskFailure(taskResult);
				}
			},
			(error) => {
				console.error('Error receiving task status updates:', error);
				this.isTaskActive = false;
			},
		);
	}

	private handleTaskSuccess(taskResult: TaskResult) {
		this.isTaskActive = false;

		const awardCount = taskResult.result?.data.length;
		if (awardCount) {
			this.recipientCount += awardCount;
		}
		// Refresh datatable
		this.loadInstances();
	}

	private handleTaskFailure(taskResult: TaskResult) {
		this.isTaskActive = false;

		const errorMessage = taskResult.result?.error || 'Batch award process failed';
		this.messageService.reportHandledError(this.translate.instant('Issuer.batchAwardFailed'), errorMessage);
	}

	cancelTaskPolling() {
		if (this.isTaskActive) {
			this.taskService.stopTaskPolling(this.badgeSlug);
			this.isTaskActive = false;
			this.currentTaskStatus = null;

			if (this.taskSubscription) {
				this.taskSubscription.unsubscribe();
				this.taskSubscription = null;
			}
		}
	}

	get isTaskPending(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.PENDING;
	}

	get isTaskProcessing(): boolean {
		return (
			this.currentTaskStatus?.status === TaskStatus.STARTED || this.currentTaskStatus?.status === TaskStatus.RETRY
		);
	}

	get isTaskCompleted(): boolean {
		return (
			this.currentTaskStatus?.status === TaskStatus.SUCCESS ||
			this.currentTaskStatus?.status === TaskStatus.FAILURE
		);
	}

	get isTaskSuccessful(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.SUCCESS;
	}

	get isTaskFailed(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.FAILURE;
	}

	revokeInstance(instance: BadgeInstance) {
		this.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: this.translate.instant('General.warning'),
				dialogBody: this.translate.instant('Issuer.revokeBadgeWarning', {
					badge: this.badgeClass.name,
					recipient: instance.recipientIdentifier,
				}),
				resolveButtonLabel: this.translate.instant('General.revoke'),
				rejectButtonLabel: this.translate.instant('General.cancel'),
			})
			.then(
				() => {
					instance.revokeBadgeInstance('Manually revoked by Issuer').then(
						(result) => {
							this.messageService.reportMinorSuccess(
								this.translate.instant('Issuer.revokeSuccess', {
									recipient: instance.recipientIdentifier,
								}),
							);
							this.badgeClass.update();
							// this.updateResults();
							// reload instances to refresh datatable
							this.loadInstances();
						},
						(error) =>
							this.messageService.reportAndThrowError(
								this.translate.instant('Issuer.revokeError', {
									recipient: instance.recipientIdentifier,
								}),
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
			.getPdf(instance.slug, 'badges')
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
					dialogBody: this.translate.instant('Badge.deleteInstancesLeft'),
					resolveButtonLabel: 'Ok',
					showRejectButton: false,
				})
				.then(
					() => void 0,
					() => void 0,
				);
		}
	}

	onTabChange(tab) {
		this.activeTab = tab;
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

	private focusRequestsOnPage() {
		if (this.focusRequests && this.qrAwards && !this.hasScrolled) {
			if (this.qrAwards.nativeElement.offsetTop > 0) this.hasScrolled = true;
			this.qrAwards.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	private focusBatchAwardingsOnPage() {
		if ((this.isTaskPending || this.isTaskProcessing) && this.batchAwards && !this.hasScrolled) {
			if (this.batchAwards.nativeElement.offsetTop > 0) this.hasScrolled = true;
			this.batchAwards.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
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
