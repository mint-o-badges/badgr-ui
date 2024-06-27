// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassIssueBulkAwardImportComponent } from './badgeclass-issue-bulk-award-import.component';
import { FormBuilder } from '@angular/forms';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { TranslateModule } from '@ngx-translate/core';

describe('BadgeClassIssueBulkAwardImportComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassIssueBulkAwardImportComponent],
			imports: [RouterTestingModule, CommonModule, ...COMMON_IMPORTS, TranslateModule.forRoot()],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassIssueBulkAwardImportComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #importAction()', async () => {
		// const result = component.importAction();
	});

	it('should run #importPreviewDataEmit()', async () => {
		// const result = component.importPreviewDataEmit();
	});

	it('should run #updateViewState()', async () => {
		// const result = component.updateViewState(state);
	});

	it('should run #onFileDataReceived()', async () => {
		// const result = component.onFileDataReceived(data);
	});

	it('should run #parseCsv()', async () => {
		// const result = component.parseCsv(rawCSV);
	});

	it('should run #createRange()', async () => {
		// const result = component.createRange(size);
	});
});
