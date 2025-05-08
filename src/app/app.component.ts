import { AfterViewInit, Component, OnInit, Renderer2, ViewChild, Inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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

import { ApiExternalToolLaunchpoint } from '../app/externaltools/models/externaltools-api.model';
import { ExternalToolsManager } from '../app/externaltools/services/externaltools-manager.service';

import { UserProfileManager } from './common/services/user-profile-manager.service';
import { NewTermsDialog } from './common/dialogs/new-terms-dialog.component';
import { QueryParametersService } from './common/services/query-parameters.service';
import { Title } from '@angular/platform-browser';
import { MarkdownHintsDialog } from './common/dialogs/markdown-hints-dialog.component';
import { Issuer } from './issuer/models/issuer.model';
import { IssuerManager } from './issuer/services/issuer-manager.service';
import { ImportModalComponent } from './mozz-transition/components/import-modal/import-modal.component';
import { ExportPdfDialog } from './common/dialogs/export-pdf-dialog/export-pdf-dialog.component';
import { CopyBadgeDialog } from './common/dialogs/copy-badge-dialog/copy-badge-dialog.component';
import { ForkBadgeDialog } from './common/dialogs/fork-badge-dialog/fork-badge-dialog.component';
import { SelectIssuerDialog } from './common/dialogs/select-issuer-dialog/select-issuer-dialog.component';
import { LanguageService } from './common/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from './common/components/badge-detail/badge-detail.component.types';

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
	styleUrls: ['./app.component.scss'],
	standalone: false,
})
export class AppComponent implements OnInit, AfterViewInit {
	/**
	 * Enables or disables the "curtain" feature, hiding the normal page.
	 */
	curtainEnabled = true;

	aboutBadgesMenuItems: MenuItem[] = [
		{
			title: 'NavItems.faq',
			routerLink: ['/public/faq'],
			icon: 'lucideFileQuestion',
		},
		{
			title: 'Badges A-Z',
			routerLink: ['/catalog/badges'],
			icon: 'lucideAward',
		},
		{
			title: 'General.institutionsNav',
			routerLink: ['/catalog/issuers'],
			icon: 'lucideWarehouse',
		},
		{
			title: 'LearningPath.learningpathsNav',
			routerLink: ['/catalog/learningpaths'],
			icon: 'lucideRoute',
		},
	];
	accountMenuItems: MenuItem[] = [
		{
			title: 'General.backpack',
			routerLink: ['/recipient/badges'],
			icon: 'lucideHexagon',
		},
		{
			title: 'NavItems.myProfile',
			routerLink: ['/profile/profile'],
			icon: 'lucideUsers',
		},
		{
			title: 'NavItems.appIntegrations',
			routerLink: ['/profile/app-integrations'],
			icon: 'lucideRepeat2',
		},
		{
			title: 'Logout',
			routerLink: ['/auth/logout'],
			icon: 'lucideLogOut',
		},
	];
	/**
	 * Permanently disables the curtain, making it impossible to show it even with the query parameter
	 */
	curtainPermanentlyDisabled = true;
	get curtain() {
		let re = /\?curtainEnabled=(\w*)/i;
		let match = this.router.url.match(re);
		if (match && match.length == 2) {
			let param: string = match[1];
			if (param == 'false' || param == 'true' || param == 'yes' || param == 'no')
				localStorage.setItem('curtainEnabled', param == 'true' || param == 'yes' ? 'true' : 'false');
		}

		let local = localStorage.getItem('curtainEnabled');
		if (local == 'false' || local == 'true') this.curtainEnabled = localStorage.getItem('curtainEnabled') == 'true';
		return this.curtainEnabled && !this.router.url.includes('impressum') && !this.curtainPermanentlyDisabled;
	}

	title = 'Badgr Angular';
	loggedIn = false;
	mobileNavOpen = false;
	isUnsupportedBrowser = false;
	launchpoints?: ApiExternalToolLaunchpoint[];
	issuers = signal<Issuer[] | undefined>(undefined);
	showIssuersTab = computed(() => {
		return !this.features.disableIssuers && this.issuers() !== undefined;
	});

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

	@ViewChild('forkBadgeDialog')
	private forkBadgeDialog: ForkBadgeDialog;

	@ViewChild('selectIssuerDialog')
	private selectIssuerDialog: SelectIssuerDialog;

	@ViewChild('issuerLink')
	private issuerLink: unknown;

	@ViewChild('importModalDialog')
	importModalDialog: ImportModalComponent;

	// For changing language of texts defined in ts file
	lngObserver = this.languageService.getSelectedLngObs();
	selectedLng: string = 'de';

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
		private titleService: Title,
		protected issuerManager: IssuerManager,
		private languageService: LanguageService, // Translation
		private translate: TranslateService,
		@Inject(DOCUMENT) private document: Document,
	) {
		// Initialize App language
		this.languageService.setInitialAppLangauge();
		this.lngObserver.subscribe((lng) => {
			if (lng != null) {
				this.selectedLng = lng;
			}
		});

		// @ts-ignore
		// Start umami tracking
		// umami.track();

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

		let language = window.localStorage.getItem('lang');
		if (!language) {
			if (navigator.language.toLocaleLowerCase().indexOf('de') == 0) {
				language = 'de';
			} else {
				language = 'en';
			}
			window.localStorage.setItem('lang', language);
		}
		this.languageService.setLanguage(language);
	}

	refreshProfile = () => {
		this.profileManager.userProfileSet.changed$.subscribe((set) => {
			if (set.entities.length && set.entities[0].agreedTermsVersion !== set.entities[0].latestTermsVersion) {
				this.commonDialogsService.newTermsDialog.openDialog();
			}

			// for issuers tab which can only be loaded when the user is verified
			this.profileManager.userProfile.emails.updateList().then(() => {
				if (this.profileManager.userProfile.isVerified)
					this.issuerManager.allIssuers$.subscribe(
						(issuers) => {
							this.issuers.set(
								issuers.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
							);
						},
						(error) => {
							this.messageService.reportAndThrowError(
								this.translate.instant('Issuer.failLoadissuers'),
								error,
							);
						},
					);
			});
		});

		// Load the profile
		this.profileManager.userProfileSet.ensureLoaded();
	};

	dismissUnsupportedBrowserMessage() {
		this.isUnsupportedBrowser = false;
	}

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
				if (loggedIn) this.refreshProfile();
			}),
		);

		// this.translate.get('General.institutionsNav').subscribe((translatedText: string) => {
		// 	this.aboutBadgesMenuItems[2].title = translatedText;
		// });

		// this.translate.get('LearningPath.learningpathsNav').subscribe((translatedText: string) => {
		// 	this.aboutBadgesMenuItems[3].title = translatedText;
		// });

		// this.translate.get('NavItems.myProfile').subscribe((translatedText: string) => {
		// 	this.accountMenuItems[1].title = translatedText;
		// });

		// this.translate.get('NavItems.appIntegrations').subscribe((translatedText: string) => {
		// 	this.accountMenuItems[2].title = translatedText;
		// });

		this.translate.onLangChange.subscribe(() => {
			this.document.documentElement.lang = this.translate.currentLang;
		});
	}

	ngAfterViewInit() {
		this.commonDialogsService.init(
			this.confirmDialog,
			this.shareSocialDialog,
			this.newTermsDialog,
			this.markdownHintsDialog,
			this.exportPdfDialog,
			this.nounprojectDialog,
			this.copyBadgeDialog,
			this.forkBadgeDialog,
			this.selectIssuerDialog,
		);
	}

	defaultLogoSmall = '../breakdown/static/images/logo.svg';
	defaultLogoDesktop = '../breakdown/static/images/logo-desktop.svg';
	get logoSmall() {
		return this.theme['logoImg'] ? this.theme['logoImg']['small'] : this.defaultLogoSmall;
	}
	get logoDesktop() {
		return this.theme['logoImg'] ? this.theme['logoImg']['desktop'] : this.defaultLogoDesktop;
	}

	// For changing language based on selection
	changeLng(lng) {
		window.localStorage.setItem('lang', lng);
		this.languageService.setLanguage(lng);
	}
}
