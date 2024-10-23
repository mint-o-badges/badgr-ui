// tslint:disable
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { Component, Directive } from '@angular/core';
import { IssuerEditComponent } from './issuer-edit.component';
import { SessionService } from '../../../common/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('IssuerEditComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [IssuerEditComponent],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				TranslateTestingModule.withTranslations('de', {}),
				...COMMON_IMPORTS,
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(IssuerEditComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', () => {
		const result = component.ngOnInit();
	});
});
