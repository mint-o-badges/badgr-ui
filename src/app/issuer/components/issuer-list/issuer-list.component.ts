import { Component, ElementRef, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { Issuer } from '../../models/issuer.model';
import { BadgeClass } from '../../models/badgeclass.model';
import { Title } from '@angular/platform-browser';
import { preloadImageURL } from '../../../common/util/file-util';
import { AppConfigService } from '../../../common/app-config.service';
import { TranslateService } from '@ngx-translate/core';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../../../common/dialogs/oeb-dialogs/success-dialog.component';
import { DialogComponent } from '../../../components/dialog.component';
import { NgModel } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PublicApiService } from '../../../public/services/public-api.service';
import { IssuerStaffRequestApiService } from '../../services/issuer-staff-request-api.service';
import { UserProfileApiService } from '../../../common/services/user-profile-api.service';
import { ApiStaffRequest } from '../../staffrequest-api.model';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { BadgrApiFailure } from '../../../common/services/api-failure';

@Component({
	selector: 'issuer-list',
	templateUrl: './issuer-list.component.html',
	standalone: false,
})
export class IssuerListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL('../../../../breakdown/static/images/placeholderavatar-issuer.svg');
	readonly noIssuersPlaceholderSrc =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-issuer.svg';

	Array = Array;

	issuers: Issuer[] = null;
	badges: BadgeClass[] = null;
	issuerToBadgeInfo: { [issuerId: string]: IssuerBadgesInfo } = {};

	issuersLoaded: Promise<unknown>;
	badgesLoaded: Promise<unknown>;
	@ViewChild('pluginBox') public pluginBoxElement: ElementRef;

	@ViewChild('headerTemplate')
	headerTemplate: TemplateRef<void>;

	@ViewChild('headerQuestionMarkTemplate')
	headerQuestionMarkTemplate: TemplateRef<void>;

	@ViewChild('requestStaffMembershipTemplate')
	requestStaffMembershipTemplate: TemplateRef<void>;

	@ViewChild('issuerInfoTemplate')
	issuerInfoTemplate: TemplateRef<void>;

	@ViewChild('staffRequestFooterTemplate')
	staffRequestFooterTemplate: TemplateRef<void>;

	@ViewChild('successfullyRequestedMembershipHeaderTemplate')
	successfullyRequestedMembershipHeaderTemplate: TemplateRef<void>;

	@ViewChild('issuerSearchInput') issuerSearchInput: ElementRef<HTMLInputElement>;
	@ViewChild('issuerSearchInputModel') issuerSearchInputModel: NgModel;

	get theme() {
		return this.configService.theme;
	}
	get features() {
		return this.configService.featuresConfig;
	}

	issuerSearchQuery = '';
	issuersShowResults = false;
	issuerSearchResults: any[] = [];
	selectedIssuer: Issuer | null = null;

	staffRequests: ApiStaffRequest[] = [];

	issuersLoading = false;
	issuerSearchLoaded = false;

	dialogRef: BrnDialogRef<any> = null;

	plural = {
		issuer: {
			'=0': this.translate.instant('Issuer.noInstitutions'),
			'=1': this.translate.instant('Issuer.oneInstitution'),
			other: this.translate.instant('Issuer.multiInstitutions'),
		},
		badges: {
			'=0': this.translate.instant('Badge.noBadges'),
			'=1': '<strong class="u-text-bold">1</strong> ' + this.translate.instant('General.badge'),
			other: '<strong class="u-text-bold">#</strong> ' + this.translate.instant('General.badges'),
		},
		recipient: {
			'=0': this.translate.instant('Badge.noRecipients'),
			'=1': this.translate.instant('Badge.oneRecipient'),
			other: this.translate.instant('Badge.multiRecipients'),
		},
	};

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected configService: AppConfigService,
		protected badgeClassService: BadgeClassManager,
		protected publicApiService: PublicApiService,
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
		private issuerStaffRequestApiService: IssuerStaffRequestApiService,
		private userProfileApiService: UserProfileApiService,
	) {
		super(router, route, loginService);
		title.setTitle(`Issuers - ${this.configService.theme['serviceName'] || 'Badgr'}`);

		// subscribe to issuer and badge class changes
		this.issuersLoaded = this.loadIssuers();

		this.badgesLoaded = new Promise<void>((resolve, reject) => {
			this.badgeClassService.badgesByIssuerUrl$.subscribe((badges) => {
				this.issuerToBadgeInfo = {};

				Object.keys(badges).forEach((issuerSlug) => {
					const issuerBadges = badges[issuerSlug];

					this.issuerToBadgeInfo[issuerSlug] = new IssuerBadgesInfo(
						issuerBadges.reduce((sum, badge) => sum + badge.recipientCount, 0),
						issuerBadges.sort((a, b) => b.recipientCount - a.recipientCount),
					);
				});

				resolve();
			});
		});
	}

	issuerSearchInputFocusOut() {
		// delay hiding for click event
		setTimeout(() => {
			this.issuersShowResults = false;
		}, 200);
	}

	loadIssuers = () => {
		return new Promise<void>((resolve, reject) => {
			this.issuerManager.allIssuers$.subscribe(
				(issuers) => {
					this.issuers = issuers.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					resolve();
				},
				(error) => {
					this.messageService.reportAndThrowError(this.translate.instant('Issuer.failLoadissuers'), error);
					resolve();
				},
			);
		});
	};

	ngOnInit() {
		super.ngOnInit();

		this.prepareTexts();

		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			console.log('lng:', event.lang);
			this.prepareTexts();
		});

		this.route.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('newsletter_confirmed')) {
				this.openSuccessDialog();
				this.router.navigate([], {
					queryParams: { newsletter_confirmed: null },
					queryParamsHandling: 'merge',
				});
			}
		});

		this.userProfileApiService.getIssuerStaffRequests().then((r) => (this.staffRequests = r.body));
	}

	async issuerSearchChange() {
		if (this.issuerSearchQuery.length >= 3) {
			this.issuersLoading = true;
			try {
				this.issuerSearchResults = [];
				this.issuerSearchResults = await this.publicApiService.searchIssuers(this.issuerSearchQuery);
			} catch (error) {
				this.messageService.reportAndThrowError(`Failed to issuers: ${error.message}`, error);
			}
			this.issuersLoading = false;
			this.issuerSearchLoaded = true;
		}
	}

	selectIssuerFromDropdown(issuer) {
		this.issuerSearchQuery = issuer.name;
		this.selectedIssuer = issuer;
	}

	ngAfterViewInit() {
		this.issuerSearchInputModel.valueChanges
			.pipe(debounceTime(500))
			.pipe(distinctUntilChanged())
			.subscribe(() => {
				this.issuerSearchChange();
			});
	}

	closeDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	requestMembership() {
		this.issuerStaffRequestApiService.requestIssuerStaffMembership(this.selectedIssuer.slug).then(
			(res) => {
				if (res.ok) {
					this.closeDialog();
					this.staffRequests.push(res.body as ApiStaffRequest);
					this.openSuccessfullyRequestedMembershipDialog();
				}
			},
			(error) => {
				this.closeDialog();
				const err = BadgrApiFailure.from(error);
				BadgrApiFailure.messageIfThrottableError(err.overallMessage) ||
					''.concat(this.translate.instant('Issuer.addMember_failed'), ': ', err.firstMessage);
				//@ts-ignore
				this.messageService.reportAndThrowError(err.payload.response.error.detail);
			},
		);
	}

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog() {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				text: this.translate.instant('Newsletter.confirmedSubscription'),
				variant: 'success',
			},
		});
	}

	public openIssuerInfoDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerTemplate,
				content: this.issuerInfoTemplate,
				variant: 'default',
				footer: false,
			},
		});

		this.dialogRef = dialogRef;
	}

	public openRequestStaffMembershipDialog() {
		const dialogRef = this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: this.headerQuestionMarkTemplate,
				content: this.requestStaffMembershipTemplate,
				variant: 'info',
				templateContext: {
					issuername: this.selectedIssuer.name,
				},
			},
		});
		this.dialogRef = dialogRef;
	}

	public openSuccessfullyRequestedMembershipDialog() {
		this._hlmDialogService.open(DialogComponent, {
			context: {
				headerTemplate: null,
				content: `
					<p class='tw-text-oebblack tw-text-lg'>
						<span>
						${this.translate.instant('Issuer.staffRequestForwarded')}
						</span>
						<span class='tw-font-bold'>
						${this.selectedIssuer.name}
						</span>
						<span>
						${this.translate.instant('General.forwarded') + '.'}
						</span>
					</p>
					<br>
					<span class='tw-text-oebblack tw-text-lg tw-mt-6'>
					${this.translate.instant('Issuer.staffRequestForwardedEmail')}
					</span>
					`,
				variant: 'success',
				footer: false,
			},
		});
	}

	// initialize predefined text
	prepareTexts() {
		// Plural
		this.plural = {
			issuer: {
				'=0': this.translate.instant('Issuer.noInstitutions'),
				'=1': this.translate.instant('Issuer.oneInstitution'),
				other: this.translate.instant('Issuer.multiInstitutions'),
			},
			badges: {
				'=0': this.translate.instant('Badge.noBadges'),
				'=1': '<strong class="u-text-bold">1</strong> ' + this.translate.instant('General.badge'),
				other: '<strong class="u-text-bold">#</strong> ' + this.translate.instant('General.badges'),
			},
			recipient: {
				'=0': this.translate.instant('Badge.noRecipients'),
				'=1': this.translate.instant('Badge.oneRecipient'),
				other: this.translate.instant('Badge.multiRecipients'),
			},
		};
	}

	revokeStaffRequest(requestId: string) {
		this.userProfileApiService.revokeIssuerStaffRequest(requestId).then((r) => {
			if (r.ok) {
				this.staffRequests = this.staffRequests.filter((req) => req.entity_id != requestId);
			}
		});
	}

	calculateDropdownMaxHeight(el: HTMLElement, minHeight = 100) {
		const rect = el.getBoundingClientRect();
		let maxHeight = Math.ceil(window.innerHeight - rect.top - rect.height - 20);
		if (maxHeight < minHeight) {
			maxHeight = Math.ceil(rect.top - 20);
		}
		return maxHeight;
	}
	calculateDropdownBottom(el: HTMLElement, minHeight = 100) {
		const rect = el.getBoundingClientRect();
		const maxHeight = Math.ceil(window.innerHeight - rect.top - rect.height - 20);
		if (maxHeight < minHeight) {
			return rect.height + 2;
		}
		return null;
	}
}

class IssuerBadgesInfo {
	constructor(
		public totalBadgeIssuanceCount = 0,
		public badges: BadgeClass[] = [],
	) {}
}
