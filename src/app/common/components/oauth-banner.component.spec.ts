// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { OAuthBannerComponent } from './oauth-banner.component';
import { MessageService } from '../services/message.service';
import { OAuthManager } from '../services/oauth-manager.service';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';

describe('OAuthBannerComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, CommonModule, ...COMMON_IMPORTS, OAuthBannerComponent],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(OAuthBannerComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});
});
