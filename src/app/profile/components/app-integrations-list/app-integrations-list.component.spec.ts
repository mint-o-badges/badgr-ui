// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { Component, Directive } from '@angular/core';
import { AppIntegrationListComponent } from './app-integrations-list.component';
import { SessionService } from '../../../common/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { AppIntegrationManager } from '../../services/app-integration-manager.service';
import { OAuthManager } from '../../../common/services/oauth-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { ApplicationCredentialsService } from '../../../common/services/application-credentials.service.';

describe('AppIntegrationListComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AppIntegrationListComponent],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				TranslateTestingModule.withTranslations('de', {}),
				...COMMON_IMPORTS,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS, 
				ApplicationCredentialsService,
				{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } }
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(AppIntegrationListComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #revokeApp()', async () => {
		// const result = component.revokeApp(app);
	});
});
