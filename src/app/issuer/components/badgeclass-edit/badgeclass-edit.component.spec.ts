// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassEditComponent } from './badgeclass-edit.component';
import { SessionService } from '../../../common/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { EventsService } from '../../../common/services/events.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('BadgeClassEditComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassEditComponent],
			imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassEditComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #badgeClassSaved()', async () => {
		// const result = component.badgeClassSaved(promise);
	});

	it('should run #editingCanceled()', async () => {
		// const result = component.editingCanceled();
	});
});
