import { ElementRef, Injectable, NgModule, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Data, Params, Router } from '@angular/router';
import { RecipientBadgeManager } from '../recipient/services/recipient-badge-manager.service';
import { BadgrTheme } from '../../theming/badgr-theme';
import { SessionService } from '../common/services/session.service';
import { EventsService } from '../common/services/events.service';
import { UserProfileManager } from '../common/services/user-profile-manager.service';
import { ExternalToolsManager } from '../externaltools/services/externaltools-manager.service';
import { SignupService } from '../signup/services/signup.service';
import { QueryParametersService } from '../common/services/query-parameters.service';
import { AppConfigService } from '../common/app-config.service';
import { MessageService } from '../common/services/message.service';
import { ZipService } from '../common/util/zip-service/zip-service.service';
import { UserProfileApiService } from '../common/services/user-profile-api.service';
import { OAuthManager } from '../common/services/oauth-manager.service';
import { DomSanitizer } from '@angular/platform-browser';
import { InitialLoadingIndicatorService } from '../common/services/initial-loading-indicator.service';
import { CommonDialogsService } from '../common/services/common-dialogs.service';
import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
import { of, Observable } from 'rxjs';
import { SettingsService } from '../common/services/settings.service';
import { IssuerManager } from '../issuer/services/issuer-manager.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgeInstanceManager } from '../issuer/services/badgeinstance-manager.service';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { AppIntegrationManager } from '../profile/services/app-integration-manager.service';
import { OAuthApiService } from '../common/services/oauth-api.service';
import { StandaloneEntitySet } from '../common/model/managed-entity-set';
import { OAuth2AppAuthorization } from '../common/model/oauth.model';
import { ApiOAuth2AppAuthorization } from '../common/model/oauth-api.model';
import { CommonEntityManager } from '../entity-manager/services/common-entity-manager.service';
import { EmbedService } from '../common/services/embed.service';
import { RecipientBadgeCollectionManager } from '../recipient/services/recipient-badge-collection-manager.service';
import { PublicApiService } from '../public/services/public-api.service';
import { BaseHttpApiService } from '../common/services/base-http-api.service';
import { NavigationService } from '../common/services/navigation.service';
import { RecipientBadgeCollectionApiService } from '../recipient/services/recipient-badge-collection-api.service';
import { ApplicationCredentialsService } from '../common/services/application-credentials.service.';
import { CaptchaService } from '../common/services/captcha.service';
import { QrCodeApiService } from '../issuer/services/qrcode-api.service';

/*@Injectable()
export class MockRouter { navigate = () => {jasmine.createSpy('navigate'); };}*/

@Injectable()
export class MockRoute {
	data = {
		subscribe: (fn: (value: Data) => void) => fn({ company: 'COMPANY' }),
	};
	params = {
		subscribe: (fn: (value: Params) => void) => fn({ tab: 0 }),
	};
	snapshot = {
		routeConfig: {
			path: '/badges/',
		},
		data: {},
		params: {
			issuerSlug: 'qwerty',
			data: {},
		},
	};
	url = null;
	queryParams = {
		//clearInitialQueryParams: () => null,
		subscribe: (fn: (value: Params) => void) => fn({ clearInitialQueryParams: () => null }),
	};
	fragment = null;
	outlet = null;
	component = null;
}

@Injectable()
export class MockHttpHandler {
	//subscribe = (fn: (value: Data) => void) => fn({});
}
@Injectable()
export class MockHttpClient {
	//subscribe = (fn: (value: Data) => void) => fn({});
}

/*@Injectable()
export class MockNgZone {
	subscribe = (fn: (value: Data) => void) => fn({});
}*/

// services
@Injectable()
export class MockZipService {}

@Injectable()
export class MockUserProfileApiService {
	subscribe = (fn: (value: Data) => void) => fn({});
}

@Injectable()
export class MockSignupService {
	subscribe = (fn: (value: Data) => void) => fn({});
}

@Injectable()
export class MockSessionService {
	subscribe = (fn: (value: Data) => void) => fn({});
	logout = () => null;
	isLoggedIn = () => true;
}

@Injectable()
export class MockMessageService {
	reportHandledError = () => {};
	reportAndThrowError = () => {};
	dismissMessage = () => {};
	getMessage = () => {};
	message$ = {
		subscribe: (fn: (value: Data) => void) => fn({}),
		unsubscribe: (fn: (value: Data) => void) => fn({}),
	};
}

@Injectable()
export class MockAppConfigService {
	theme = (): BadgrTheme => {
		return {
			serviceName: 'Badger',
			welcomeMessage: 'Badger',
			showPoweredByBadgr: true,
			showApiDocsLink: true,
			showPoweredByOSL: false,
			loadingImg: {
				imageUrl: 'string',
			},
			useColorNavbar: true,
			logoImg: {
				small: 'string',
				desktop: 'string',
			},
		};
	};

	featuresConfig = {};
}

@Injectable()
export class MockSettingsService {
	loadSettings = () => null;
	saveSettings = () => null;
}

@Injectable()
export class MockPublicApiService {
	loadSettings = () => null;
	saveSettings = () => null;
	getBadgeAssertion = () => new Promise(() => {});
	getBadgeCollection = () => new Promise(() => {});
	getBadgeClass = () => new Promise(() => {});
	getIssuerWithBadges = () => new Promise(() => {});
}

@Injectable()
export class MockQueryParametersService {
	clearInitialQueryParams = () => null;
	queryStringValue = () => null;
}
@Injectable()
export class MockInitialLoadingIndicatorService {}

@Injectable()
export class MockRecipientBadgeCollectionApiService {}

@Injectable()
export class MockQrCodeApiService {
	getQrCodesForIssuerByBadgeClass = () => new Promise(() => {});
	createQrCode = () => new Promise(() => {});
	updateQrCode = () => new Promise(() => {});
	deleteQrCode = () => new Promise(() => {});
}

@Injectable()
export class MockOAuthApiService {
	listAuthorizations = () => new Promise(() => {});
}

@Injectable()
export class MockCaptchaService {
	getCaptcha = () => new Promise(() => {});
	setupCaptcha = () => new Promise(() => {})
}

export const commonDialog = {
	open: false,
	openDialog: () => new Promise(() => {}),
	closeDialog: () => new Promise(() => {}),
	openResolveRejectDialog: () => new Promise(() => {}),
};
@Injectable()
export class MockCommonDialogsService {
	markdownHintsDialog = commonDialog;
	badgeSelectionDialog = commonDialog;
	recipientBadgeDialog = commonDialog;
	confirmDialog = commonDialog;
	shareSocialDialog = commonDialog;
	addBadgeDialog = commonDialog;
	collectionSelectionDialog = commonDialog;
	copyBadgeDialog = commonDialog;
	forkBadgeDialog = commonDialog;
}

// managers
@Injectable()
export class MockOAuthManager {
	listAuthorizations = () => new Promise(() => {});
	oauthApi: MockOAuthApiService;
	private commonEntityManager: CommonEntityManager;
	readonly authorizedApps = new StandaloneEntitySet<OAuth2AppAuthorization, ApiOAuth2AppAuthorization>(
		() => new OAuth2AppAuthorization(this.commonEntityManager),
		(apiModel) => apiModel.entityId,
		() => null, //this.oauthApi.listAuthorizations()
	);
}

@Injectable()
export class MockRecipientBadgeManager {
	recipientBadgeList = {
		changed$: new Observable(),
		loadedPromise: new Promise(() => {}),
		entityForSlug: () => {},
	};
	recipientBadgeApiService = {
		saveInstance: new Promise(() => {}),
	};
}

@Injectable()
export class MockExternalToolsManager {
	externaltoolsList = {
		updateIfLoaded: () => {},
	};
	getToolLaunchpoints = () => new Promise(() => {});
}

@Injectable()
export class MockUserProfileManager {
	userProfilePromise = new Promise(() => ({}));
	userProfileSet = { updateList: () => new Promise(() => ({})) };
}

@Injectable()
export class MockBadgeClassManager {
	badgeByIssuerSlugAndSlug = () => new Promise(() => ({ name: 'badgename' }));
	removeBadgeClass = () => {};
	createBadgeClass = () => {};
	get allPublicBadges$(): Observable<object[]> {
		return of([
			{
				name: 'badgename',
				apiModel: {
					source_url: 'source.url',
				},
			},
		]);
	}
}

@Injectable()
export class MockRecipientBadgeCollectionManager {
	recipientBadgeCollectionList = () =>
		new Promise((q) => {
			console.log(q);
		});
}

@Injectable()
export class MockBadgeCollectionManager {}

@Injectable()
export class MockBadgeInstanceManager {}

@Injectable()
export class MockIssuerManager {
	issuerBySlug = () =>
		new Promise((q) => {
			console.log(q);
		});
	getAllIssuers = () => of();
}

@Injectable()
export class MockAppIntegrationManager {}

@Injectable()
export class MockBaseHttpApiService {
	baseUrl = '';
}

@Injectable()
export class MockNavigationService {
	findAndApplyRouteNavConfig = (route: string) =>
		new Promise((q) => {
			console.log(q);
		});
}

@Injectable()
export class MockEventsService {
	profileEmailsChanged = () => new Promise(() => null);
	recipientBadgesStale = () => new Promise(() => null);
	documentClicked = new Observable(() => {});
	externalToolLaunch = new Observable(() => {});
}
@Injectable()
export class MockEmbedService {}
@Injectable()
export class MockElementRef {
	nativeElement = {};
}

@Injectable()
export class MockDomSanitizer {
	sanitize = () => 'safeString';
	bypassSecurityTrustUrl = () => 'safeString';
	bypassSecurityTrustHtml = () => 'safeString';
}

@Injectable()
export class MockApplicationCredentialsService {
	generateCredentials = () => new Promise(() => {});
	getMyCredentials = () => new Promise(() => {});
	deleteCredentials = () => new Promise(() => {});
}

export let COMMON_MOCKS_PROVIDERS = [];
export let COMMON_MOCKS_PROVIDERS_WITH_SUBS = [];

[
	DomSanitizer,
	HttpHandler,
	HttpClient,
	BaseHttpApiService,
	PublicApiService,
	ZipService,
	SessionService,
	MessageService,
	AppConfigService,
	SettingsService,
	NavigationService,
	QueryParametersService,
	SignupService,
	UserProfileApiService,
	InitialLoadingIndicatorService,
	CommonDialogsService,
	OAuthApiService,
	RecipientBadgeCollectionApiService,
	OAuthManager,
	AppIntegrationManager,
	ExternalToolsManager,
	UserProfileManager,
	BadgeClassManager,
	BadgeInstanceManager,
	IssuerManager,
	EventsService,
	EmbedService,
	ElementRef,
	RecipientBadgeCollectionManager,
	RecipientBadgeManager,
	ApplicationCredentialsService,
	CaptchaService,
	QrCodeApiService
].forEach((m, i, a) => {
	const thisMock = eval('Mock' + m.name);
	COMMON_MOCKS_PROVIDERS.push(thisMock);
	COMMON_MOCKS_PROVIDERS_WITH_SUBS.push({ provide: m, useClass: thisMock });
	return a;
});

@NgModule({
	exports: [],
	imports: [CommonModule],
	providers: [...COMMON_MOCKS_PROVIDERS],
})
export class MocksModuleSpec {}
