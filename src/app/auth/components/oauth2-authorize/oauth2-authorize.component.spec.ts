// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { OAuth2AuthorizeComponent } from './oauth2-authorize.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { AppConfigService } from '../../../common/app-config.service';
import { InitialLoadingIndicatorService } from '../../../common/services/initial-loading-indicator.service';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';

@Injectable()
class MockRouter {
	/*navigate = jest.fn();*/
}

@Injectable()
class MockMessageService {}

@Injectable()
class MockSessionService {}

@Injectable()
class MockOAuthManager {}

@Injectable()
class MockQueryParametersService {}

@Injectable()
class MockAppConfigService {}

@Injectable()
class MockInitialLoadingIndicatorService {}

describe('OAuth2AuthorizeComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, BadgrCommonModule, ...COMMON_IMPORTS],
			declarations: [OAuth2AuthorizeComponent],
			providers: [Title, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(OAuth2AuthorizeComponent);
		component = fixture.debugElement.componentInstance;
	});

	xit('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #iconName()', async () => {
		const result = component.iconName('scopeCssName');
	});

	xit('should run #cancelAuthorization()', async () => {
		const result = component.cancelAuthorization();
	});

	xit('should run #authorizeApp()', async () => {
		const result = component.authorizeApp();
	});

	xit('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});
});
