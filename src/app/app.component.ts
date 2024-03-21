import { AfterViewInit, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from './common/services/message.service';
import { SessionService } from './common/services/session.service';
import { CommonDialogsService } from './common/services/common-dialogs.service';
import { AppConfigService } from './common/app-config.service';
import { ShareSocialDialog } from './common/dialogs/share-social-dialog/share-social-dialog.component';
import { ConfirmDialog } from './common/dialogs/confirm-dialog.component';
import { NounprojectDialog } from './common/dialogs/nounproject-dialog/nounproject-dialog.component';

import '../thirdparty/scopedQuerySelectorShim';
import { EventsService } from './common/services/events.service';
import { OAuthManager } from './common/services/oauth-manager.service';
import { EmbedService } from './common/services/embed.service';
import { InitialLoadingIndicatorService } from './common/services/initial-loading-indicator.service';
import { Angulartics2GoogleTagManager } from 'angulartics2';

import { ApiExternalToolLaunchpoint } from '../app/externaltools/models/externaltools-api.model';
import { ExternalToolsManager } from '../app/externaltools/services/externaltools-manager.service';

import { UserProfileManager } from './common/services/user-profile-manager.service';
import { NewTermsDialog } from './common/dialogs/new-terms-dialog.component';
import { QueryParametersService } from './common/services/query-parameters.service';
import { Title } from '@angular/platform-browser';
import { MarkdownHintsDialog } from './common/dialogs/markdown-hints-dialog.component';
import { Issuer } from './issuer/models/issuer.model';
import { IssuerManager } from './issuer/services/issuer-manager.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { ImportModalComponent } from './mozz-transition/components/import-modal/import-modal.component';
import { ExportPdfDialog } from './common/dialogs/export-pdf-dialog/export-pdf-dialog.component';
import { CopyBadgeDialog } from './common/dialogs/copy-badge-dialog/copy-badge-dialog.component';

// Shim in support for the :scope attribute
// See https://github.com/lazd/scopedQuerySelectorShim and
// https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children/21126966#21126966

@Component({
	selector: 'app-root',
	host: {
		'(document:click)': 'onDocumentClick($event)',
		'[class.l-stickyfooter-chromeless]': '! showAppChrome',
	},
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
	title = 'Badgr Angular';
	loggedIn = false;
	mobileNavOpen = false;
	isUnsupportedBrowser = false;
	launchpoints?: ApiExternalToolLaunchpoint[];
	issuers: Issuer[];
	issuersLoaded: Promise<unknown>;

	copyrightYear = new Date().getFullYear();

	@ViewChild('confirmDialog')
	private confirmDialog: ConfirmDialog;

	@ViewChild('nounprojectDialog')
	private nounprojectDialog: NounprojectDialog;

	@ViewChild('newTermsDialog')
	private newTermsDialog: NewTermsDialog;

	@ViewChild('shareSocialDialog')
	private shareSocialDialog: ShareSocialDialog;

	@ViewChild('markdownHintsDialog')
	private markdownHintsDialog: MarkdownHintsDialog;

	@ViewChild('exportPdfDialog')
	private exportPdfDialog: ExportPdfDialog;

	@ViewChild('copyBadgeDialog')
	private copyBadgeDialog: CopyBadgeDialog;

	@ViewChild('issuerLink')
	private issuerLink: unknown;

	@ViewChild('importModalDialog')
	importModalDialog: ImportModalComponent;

	get showAppChrome() {
		return !this.embedService.isEmbedded;
	}

	get theme() {
		return this.configService.theme;
	}

	get features() {
		return this.configService.featuresConfig;
	}

	get apiBaseUrl() {
		return this.configService.apiConfig.baseUrl;
	}

	get hasFatalError(): boolean {
		return this.messageService.hasFatalError;
	}
	get fatalMessage(): string {
		return this.messageService.message ? this.messageService.message.message : undefined;
	}
	get fatalMessageDetail(): string {
		return this.messageService.message ? this.messageService.message.detail : undefined;
	}

	readonly unavailableImageSrc = '../assets/@concentricsky/badgr-style/dist/images/image-error.svg';

	initFinished: Promise<unknown> = new Promise(() => {});

	constructor(
		private sessionService: SessionService,
		private profileManager: UserProfileManager,
		private router: Router,
		private messageService: MessageService,
		private configService: AppConfigService,
		private commonDialogsService: CommonDialogsService,
		private eventService: EventsService,
		private oAuthManager: OAuthManager,
		private embedService: EmbedService,
		private renderer: Renderer2,
		private queryParams: QueryParametersService,
		private externalToolsManager: ExternalToolsManager,
		private initialLoadingIndicatorService: InitialLoadingIndicatorService,
		private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
		private angulartics2GoogleTagManager: Angulartics2GoogleTagManager, // required for angulartics to work
		private titleService: Title,
		protected issuerManager: IssuerManager
	) {
		angulartics2GoogleTagManager.startTracking();

		messageService.useRouter(router);

		titleService.setTitle(this.configService.theme['serviceName'] || 'Badgr');

		this.initScrollFix();

		const authCode = this.queryParams.queryStringValue('authCode', true);
		if (sessionService.isLoggedIn && !authCode) this.refreshProfile();

		this.externalToolsManager.getToolLaunchpoints('navigation_external_launch').then((launchpoints) => {
			this.launchpoints = launchpoints.filter((lp) => Boolean(lp));
		});

		if (this.embedService.isEmbedded) {
			// Enable the embedded indicator class on the body
			renderer.addClass(document.body, 'embeddedcontainer');
		}
	}

	refreshProfile = () => {
		this.profileManager.userProfileSet.changed$.subscribe((set) => {
			if (set.entities.length && set.entities[0].agreedTermsVersion !== set.entities[0].latestTermsVersion) {
				this.commonDialogsService.newTermsDialog.openDialog();
			}
		});

		// Load the profile
		this.profileManager.userProfileSet.ensureLoaded();

		// for issuers tab
		this.issuerManager.allIssuers$.subscribe(
			(issuers) => {
				this.issuers = issuers.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
				this.shouldShowIssuersTab();
			},
			(error) => {
				this.messageService.reportAndThrowError('Failed to load issuers', error);
			}
		);
	};

	dismissUnsupportedBrowserMessage() {
		this.isUnsupportedBrowser = false;
	}

	showIssuersTab = false;
	shouldShowIssuersTab = () =>
		(this.showIssuersTab = !this.features.disableIssuers || (this.issuers && this.issuers.length > 0));

	toggleMobileNav() {
		this.mobileNavOpen = !this.mobileNavOpen;
	}
	get isOAuthAuthorizationInProcess() {
		return this.oAuthManager.isAuthorizationInProgress;
	}

	onDocumentClick($event: MouseEvent) {
		this.eventService.documentClicked.next($event);
	}

	get isRequestPending() {
		return this.messageService.pendingRequestCount > 0;
	}

	private initScrollFix() {
		// Scroll the header into view after navigation, mainly for mobile where the menu is at the bottom of the display
		this.router.events.subscribe((url) => {
			this.mobileNavOpen = false;
			const header = document.querySelector('header') as HTMLElement;
			if (header) {
				header.scrollIntoView();
			}
		});
	}

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;

		this.sessionService.loggedin$.subscribe((loggedIn) =>
			setTimeout(() => {
				this.loggedIn = loggedIn;
				this.refreshProfile();
			})
		);
		this.shouldShowIssuersTab();
	}

	ngAfterViewInit() {
		this.commonDialogsService.init(
			this.confirmDialog,
			this.shareSocialDialog,
			this.newTermsDialog,
			this.markdownHintsDialog,
			this.exportPdfDialog,
			this.nounprojectDialog,
			this.copyBadgeDialog
		);
	}

	defaultLogoSmall = '../../assets/logos/header-logo.svg';
	defaultLogoDesktop = '../../assets/logos/header-logo.svg';
	get logoSmall() {
		return this.theme['logoImg'] ? this.theme['logoImg']['small'] : this.defaultLogoSmall;
	}
	get logoDesktop() {
		return this.theme['logoImg'] ? this.theme['logoImg']['desktop'] : this.defaultLogoDesktop;
	}
}
