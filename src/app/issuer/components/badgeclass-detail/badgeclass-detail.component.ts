import { Component, ElementRef, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
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
import { AppConfigService } from '../../../common/app-config.service';
import { LinkEntry } from '../../../common/components/bg-breadcrumbs/bg-breadcrumbs.component';
import { BadgeClassCategory, BadgeClassLevel } from '../../models/badgeclass-api.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PageConfig } from '../../../common/components/badge-detail/badge-detail.component.types';
import { PdfService } from '../../../common/services/pdf.service';
import { QrCodeApiService } from '../../services/qrcode-api.service';
import { InfoDialogComponent } from '../../../common/dialogs/oeb-dialogs/info-dialog.component';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { inject, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { LearningPathApiService } from '../../../common/services/learningpath-api.service';
import { ApiLearningPath } from '../../../common/model/learningpath-api.model';
import { TaskResult, TaskStatus, TaskPollingManagerService } from '../../../common/task-manager.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { DialogComponent } from '../../../components/dialog.component';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { BgBadgeDetail } from '../../../common/components/badge-detail/badge-detail.component';
import { QrCodeAwardsComponent } from '../qrcode-awards/qrcode-awards.component';
import { IssuerDetailDatatableComponent } from '../../../components/datatable-issuer-detail.component';
import { FormsModule, NgModel } from '@angular/forms';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmH2 } from '@spartan-ng/helm/typography';
import { NetworkManager } from '~/issuer/services/network-manager.service';
import { Network } from '~/issuer/network.model';
import { BadgeInstanceApiService } from '~/issuer/services/badgeinstance-api.service';
import { OebTabsComponent } from '~/components/oeb-tabs.component';
import { ApiBadgeInstance } from '~/issuer/models/badgeinstance-api.model';
import { ApiQRCode, NetworkQrCodeGroup } from '~/issuer/models/qrcode-api.model';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { PublicApiService } from '~/public/services/public-api.service';
import { SelectNetworkComponent } from '../select-network/select-network.component';

interface groupedInstances {
	has_access: boolean;
	instance_count: number;
	instances: ApiBadgeInstance[];
	issuer: any;
}
@Component({
	selector: 'badgeclass-detail',
	templateUrl: './badgeclass-detail.component.html',
	imports: [
		BgBadgeDetail,
		QrCodeAwardsComponent,
		IssuerDetailDatatableComponent,
		HlmH2,
		FormsModule,
		OebButtonComponent,
		TranslatePipe,
		OebTabsComponent,
		SelectNetworkComponent,
	],
})
export class BadgeClassDetailComponent
	extends BaseAuthenticatedRoutableComponent
	implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy
{
	@ViewChild('qrAwards') qrAwards!: ElementRef;
	@ViewChild('batchAwards') batchAwards!: ElementRef;

	@ViewChild('issuerSelection')
	issuerSelection: TemplateRef<void>;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	@ViewChild('networkIssuerSelection')
	networkIssuerSelection: TemplateRef<void>;

	@ViewChild('networkIssuerSelectionHeader')
	networkIssuerSelectionHeader: TemplateRef<void>;

	@ViewChild('networkSelectionHeader')
	networkSelectionHeader: TemplateRef<void>;

	@ViewChild('networkSelection')
	networkSelection: TemplateRef<void>;

	@ViewChild('networkSearchInputModel') networkSearchInputModel: NgModel;

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

	private readonly _hlmDialogService = inject(HlmDialogService);

	private statusSubscription: Subscription | null = null;

	badgeClassLoaded: Promise<unknown>;
	badgeInstancesLoaded: Promise<unknown>;
	partnerInstancesLoaded: Promise<unknown>;
	groupedPartnerInstances: any[] = [];
	assertionsLoaded: Promise<unknown>;
	issuerLoaded: Promise<unknown>;
	learningPaths: ApiLearningPath[];
	showAssertionCount = false;
	badgeClass: BadgeClass;
	allBadgeInstances: BadgeClassInstances;
	awardingIssuers: Issuer[];
	instanceResults: BadgeInstance[] = [];
	popInstance: BadgeInstance | null = null;
	resultsPerPage = 100;
	issuer: Issuer | Network;
	crumbs: LinkEntry[];
	focusRequests: boolean;
	hasScrolled: boolean = false;
	userIssuers: Issuer[] = [];
	dialogRef: BrnDialogRef<unknown> = null;
	selectedIssuer: Issuer = null;
	selectedNetworkIssuer: Issuer = null;

	networkSearchQuery = '';

	networkShowResults = false;
	networksLoading = false;
	networkSearchLoaded = false;
	networkSearchResults = [];

	issuerNetworks: Network[] = null;

	isLoadingIssuers = signal(false);
	networkUserIssuers = signal<Issuer[]>([]);

	config: PageConfig;

	qrCodeButtonText = 'Badge über QR-Code vergeben';
	qrCodeAwards: ApiQRCode[] = [];

	networkQrCodeApiAwards: NetworkQrCodeGroup[] = [];

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
		protected commonManager: CommonEntityManager,
		protected networkManager: NetworkManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected qrCodeApiService: QrCodeApiService,
		protected publicApiService: PublicApiService,
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected dialogService: CommonDialogsService,
		protected configService: AppConfigService,
		protected pdfService: PdfService,
		private sanitizer: DomSanitizer,
		private translate: TranslateService,
		private learningPathApiService: LearningPathApiService,
		private taskService: TaskPollingManagerService,
		protected userProfileManager: UserProfileManager,
		protected badgeInstanceApiService: BadgeInstanceApiService,
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

		try {
			this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
				(issuer) => {
					this.issuer = issuer;
					this.issuerNetworks = this.issuer.networks.map((n) => {
						return new Network(this.commonManager, n);
					});
				},
				(error) => this.messageService.reportLoadingError(`Cannot find issuer ${this.issuerSlug}`, error),
			);
		} catch {
			this.issuerLoaded = networkManager.networkBySlug(this.issuerSlug).then(
				(network) => {
					this.issuer = network;
				},
				(error) => this.messageService.reportLoadingError(`Cannot find issuer ${this.issuerSlug}`, error),
			);
		}

		Promise.all([this.issuerLoaded, this.badgeClassLoaded])
			.then(() => {
				if (this.issuer.is_network) {
					this.loadNetworkQrCodes(this.issuerSlug, this.badgeSlug);
					this.loadPartnerInstances();
					this.loadNetworkUserIssuers();
					this.loadInstances();
				} else {
					this.qrCodeApiService
						.getQrCodesForIssuerByBadgeClass(this.issuerSlug, this.badgeSlug)
						.then((qrCodes) => {
							this.qrCodeAwards = qrCodes;
						});
					this.loadInstances();
				}
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
				title: 'QrCode.qrAwards',
				component: this.qrAwards,
			},
			{
				key: 'recipients',
				title: 'Badge.multiRecipients',
				component: this.batchAwards,
			},
		];
	}

	shareOnNetwork() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.networkSelectionHeader,
				content: this.networkSelection,
			},
		});
		this.dialogRef = dialogRef;
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

	closeDialog(result = '') {
		if (this.dialogRef) {
			if ((result = 'continue')) {
				this.dialogRef.close('continue');
			} else {
				this.dialogRef.close();
			}
		}
	}

	routeToBadgeCreation(issuer: Issuer) {
		this.closeDialog();
		this.router.navigate(['/issuer/issuers', issuer.slug, 'badges', 'create'], {
			state: { copybadgeid: this.badgeClass.slug },
		});
	}

	async loadPartnerInstances() {
		this.learningPaths = await this.learningPathApiService.getLearningPathsForBadgeClass(this.badgeSlug);

		this.badgeInstancesLoaded = this.badgeInstanceApiService
			.listNetworkBadgeInstances(this.issuer.slug, this.badgeClass.slug)
			.then((res: Record<string, groupedInstances[]>) => {
				const grouped = Object.values(res)[0] as groupedInstances[];

				// convert ApiBadgeInstance[] to BadgeInstance[]
				const tempSet = new BadgeClassInstances(
					this.badgeInstanceManager,
					this.issuerSlug,
					this.badgeClass.slug,
				);

				this.groupedPartnerInstances = grouped.map((group) => ({
					...group,
					instances: group.instances.map((apiInst) => new BadgeInstance(tempSet, apiInst)),
				}));
				this.loadConfig(this.badgeClass);
			});
	}

	async loadNetworkUserIssuers() {
		try {
			this.isLoadingIssuers.set(true);
			const apiIssuers = await this.networkManager.networkUserIssuers(this.issuerSlug);
			const issuers = apiIssuers.map((apiIssuer) => new Issuer(this.commonManager, apiIssuer));
			this.networkUserIssuers.set(issuers);
		} catch (error) {
			console.error('Error loading network issuers:', error);
			this.networkUserIssuers.set([]);
		} finally {
			this.isLoadingIssuers.set(false);
		}
	}

	loadConfig(badgeClass: BadgeClass) {
		this.config = {
			crumbs: this.crumbs,
			badgeTitle: badgeClass.name,
			awardCriteria: badgeClass.criteria,
			headerButton: {
				title: 'Badge.award',
				action: () => this.routeToBadgeAward(badgeClass, this.issuer),
			},
			issueQrRouterLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'qr'],
			qrCodeButton: {
				title: 'Badge.awardQRCode',
				show: true,
				action: () => this.routeToQRCodeAward(badgeClass, this.issuer),
			},
			badgeDescription: badgeClass.description,
			issuerSlug: this.issuerSlug,
			slug: this.badgeSlug,
			createdAt: badgeClass.createdAt,
			updatedAt: badgeClass.updatedAt,
			duration: badgeClass.extension['extensions:StudyLoadExtension'].StudyLoad,
			category: this.translate.instant(
				`Badge.categories.${badgeClass.extension['extensions:CategoryExtension']?.Category || 'participation'}`,
			),
			tags: badgeClass.tags,
			issuerName: badgeClass.issuerName,
			issuerImagePlacholderUrl: this.issuerImagePlacholderUrl,
			issuerImage: this.issuer.image,
			awardingIssuers: this.awardingIssuers,
			networkBadge: badgeClass.isNetworkBadge,
			sharedOnNetwork: badgeClass.sharedOnNetwork,
			badgeLoadingImageUrl: this.badgeLoadingImageUrl,
			badgeFailedImageUrl: this.badgeFailedImageUrl,
			badgeImage: badgeClass.image,
			competencies: badgeClass.extension['extensions:CompetencyExtension'],
			license: badgeClass.extension['extensions:LicenseExtension'] ? true : false,
			learningPaths: this.learningPaths,
			copy_permissions: badgeClass.copyPermissions,
			menuitems: [
				{
					title: 'Badge.shareOnNetwork',
					action: this.shareOnNetwork.bind(this),
					icon: 'lucideShare2',
					disabled:
						(this.issuer instanceof Issuer
							? !(this.issuer.networks && this.issuer.networks.length > 0)
							: true) || badgeClass.copyPermissions.includes('none'),
				},
				{
					title: badgeClass.copyPermissions.includes('others') ? 'General.copy' : 'Badge.copyThisIssuer',
					action: this.copyBadge.bind(this),
					icon: 'lucideCopy',
					disabled: !this.issuer.canCreateBadge || badgeClass.copyPermissions.includes('none'),
				},
				{
					title: 'Badge.editCopyStatus',
					routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'copypermissions'],
					icon: 'lucideCopyX',
					disabled: !this.issuer.canEditBadge || badgeClass.copyPermissions.includes('none'),
				},
				{
					title: 'General.edit',
					routerLink: ['/issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug, 'edit'],
					disabled:
						badgeClass.recipientCount > 0 || !this.issuer.canEditBadge || this.qrCodeAwards.length > 0,
					icon: 'lucidePencil',
				},
				{
					title: 'General.delete',
					icon: 'lucideTrash2',
					action: () => this.deleteBadge(),
					disabled: !this.issuer.canEditBadge,
				},
			],
		};
		if (badgeClass.extension['extensions:CategoryExtension']?.Category === 'learningpath') {
			this.config.headerButton = null;
			this.config.qrCodeButton.show = false;
		}
	}

	async loadNetworkQrCodes(networkSlug: string, badgeSlug: string) {
		try {
			const qrCodesByIssuer = await this.qrCodeApiService.getQrCodesForNetworkBadge(networkSlug, badgeSlug);

			if (qrCodesByIssuer) {
				this.networkQrCodeApiAwards = Object.keys(qrCodesByIssuer).map((issuerSlug) => {
					const issuerData = qrCodesByIssuer[issuerSlug];

					const issuerEntity = new Issuer(this.commonManager, issuerData.issuer);

					return {
						issuer: issuerEntity,
						qrcodes: issuerData.qrcodes,
						staff: issuerData.staff,
					};
				});
			}
		} catch (error) {
			console.error('Error loading network QR codes:', error);
		}
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
			async (retInstances) => {
				this.crumbs = [
					{ title: 'Meine Institutionen', routerLink: ['/issuer/issuers'] },
					{ title: this.issuer.name, routerLink: ['/issuer/issuers/' + this.issuerSlug] },
					{
						title: this.badgeClass.name,
						routerLink: ['/issuer/issuers/' + this.issuerSlug + '/badges/' + this.badgeSlug],
					},
				];
				this.allBadgeInstances = retInstances;
				const issuerUrls = retInstances.entities.map((i) => i.issuerUrl);
				this.awardingIssuers = await this.issuerManager.issuersByUrls(issuerUrls);
				this.updateResults();
				this.loadConfig(this.badgeClass);
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
			if (badge.recipientCount === 0 && qrCodes.length === 0 && !this.issuer.is_network) {
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
			} else if (this.issuer.is_network) {
				const dialogRef = this._hlmDialogService.open(DialogComponent, {
					context: {
						headerTemplate: this.networkIssuerSelectionHeader,
						content: this.networkIssuerSelection,
					},
				});
				this.dialogRef = dialogRef;
				this.dialogRef.closed$.subscribe((result) => {
					if (result === 'continue')
						this.router.navigate([
							'/issuer/issuers/',
							this.selectedNetworkIssuer.slug,
							'badges',
							badge.slug,
							'issue',
						]);
				});
			} else {
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']);
			}
		});
	}

	routeToQRCodeAward(badge, issuer) {
		this.qrCodeApiService.getQrCodesForIssuerByBadgeClass(this.issuer.slug, badge.slug).then((qrCodes) => {
			if (badge.recipientCount === 0 && qrCodes.length === 0 && !this.issuer.is_network) {
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
			} else if (this.issuer.is_network) {
				const dialogRef = this._hlmDialogService.open(DialogComponent, {
					context: {
						headerTemplate: this.networkIssuerSelectionHeader,
						content: this.networkIssuerSelection,
					},
				});
				this.dialogRef = dialogRef;
				this.dialogRef.closed$.subscribe((result) => {
					if (result === 'continue')
						this.router.navigate([
							'/issuer/issuers/',
							this.selectedNetworkIssuer.slug,
							'badges',
							badge.slug,
							'qr',
						]);
				});
			} else {
				this.router.navigate(['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'qr']);
			}
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
}
