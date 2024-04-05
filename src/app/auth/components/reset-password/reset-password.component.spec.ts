// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { ResetPasswordComponent } from './reset-password.component';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../common/app-config.service';
import { MessageService } from '../../../common/services/message.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('ResetPasswordComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ResetPasswordComponent],
			imports: [RouterTestingModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [FormBuilder, Title, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(ResetPasswordComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #submitChange()', async () => {
		const result = component.submitChange();
	});

	xit('should run #passwordsMatch()', async () => {
		// const result = component.passwordsMatch(group);
	});
});
