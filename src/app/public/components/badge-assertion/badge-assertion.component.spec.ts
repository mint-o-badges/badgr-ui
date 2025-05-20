// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive, Injector } from '@angular/core';
import { PublicBadgeAssertionComponent } from './badge-assertion.component';
import { EmbedService } from '../../../common/services/embed.service';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { LoadedRouteParam } from '../../../common/util/loaded-route-param';

describe('PublicBadgeAssertionComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS, PublicBadgeAssertionComponent],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();
		// jasmine.createSpy('LoadedRouteParam');
		fixture = TestBed.createComponent(PublicBadgeAssertionComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #generateFileName()', async () => {
		// const result = component.generateFileName(assertion, fileExtension);
	});

	xit('should run #openSaveDialog()', async () => {
		// component.openSaveDialog(assertion);
	});

	xit('should run #mimeToExtension()', async () => {
		// const result = component.mimeToExtension(mimeType);
	});
});
