// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By, Title } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassIssueComponent } from './badgeclass-issue.component';
// import {Title, MessageService, EventsService, IssuerManager, BadgeClassManager, BadgeInstanceManager, CommonDialogsService, SessionService, Router, ActivatedRoute} from 'striptags';
import { AppConfigService } from '../../../common/app-config.service';
import { MessageService } from '../../../common/services/message.service';
import { EventsService } from '../../../common/services/events.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { SessionService } from '../../../common/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('BadgeClassIssueComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassIssueComponent],
			imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassIssueComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		// const result = component.ngOnInit();
	});

	it('should run #enableEvidence()', async () => {
		// const result = component.enableEvidence();
	});

	it('should run #toggleExpiration()', async () => {
		// const result = component.toggleExpiration();
	});

	it('should run #addEvidence()', async () => {
		// const result = component.addEvidence();
	});

	it('should run #onSubmit()', async () => {
		// const result = component.onSubmit();
	});

	it('should run #removeEvidence()', async () => {
		// const result = component.removeEvidence(i);
	});
});
