// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassIssueBulkAwardComponent } from './badgeclass-issue-bulk-award.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { FormBuilder } from '@angular/forms';
import { IssuerManager } from '../../services/issuer-manager.service';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfigService } from '../../../common/app-config.service';
import { Title } from '@angular/platform-browser';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('BadgeClassIssueBulkAwardComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassIssueBulkAwardComponent],
			imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassIssueBulkAwardComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #onBulkIssueImportPreviewData()', async () => {
		// const result = component.onBulkIssueImportPreviewData(importPreviewData);
	});

	it('should run #onTransformedImportData()', async () => {
		// const result = component.onTransformedImportData(transformedImportData);
	});

	it('should run #updateViewState()', async () => {
		// const result = component.updateViewState(state);
	});

	it('should run #navigateToIssueBadgeInstance()', async () => {
		// const result = component.navigateToIssueBadgeInstance();
	});

	it('should run #createRange()', async () => {
		// const result = component.createRange(size);
	});
});
