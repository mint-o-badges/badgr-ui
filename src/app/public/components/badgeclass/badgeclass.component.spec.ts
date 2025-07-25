// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive, Injector } from '@angular/core';
import { PublicBadgeClassComponent } from './badgeclass.component';
import { EmbedService } from '../../../common/services/embed.service';
import { AppConfigService } from '../../../common/app-config.service';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { RecipientBadgeApiService } from '../../../recipient/services/recipient-badges-api.service';

describe('PublicBadgeClassComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				...COMMON_IMPORTS,
				PublicBadgeClassComponent,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
				RecipientBadgeApiService,
				AppConfigService,
				{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(PublicBadgeClassComponent);
		component = fixture.debugElement.componentInstance;
	});

	xit('should create a component', async () => {
		expect(component).toBeTruthy();
	});
});
