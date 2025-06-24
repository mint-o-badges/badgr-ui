// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { RequestPasswordResetComponent } from './request-password-reset.component';
import { FormBuilder } from '@angular/forms';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('RequestPasswordResetComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        BadgrCommonModule,
        ...COMMON_IMPORTS,
        TranslateTestingModule.withTranslations('de', {}),
        RequestPasswordResetComponent,
    ],
    providers: [FormBuilder, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    teardown: { destroyAfterEach: false },
}).compileComponents();
		fixture = TestBed.createComponent(RequestPasswordResetComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #submitResetRequest()', async () => {
		const result = component.submitResetRequest();
	});
});
