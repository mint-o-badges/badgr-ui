// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { RecipientBadgeCollectionEditFormComponent } from './recipient-badge-collection-edit-form.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RecipientBadgeCollectionManager } from '../../services/recipient-badge-collection-manager.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('RecipientBadgeCollectionEditFormComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				...COMMON_IMPORTS,
				RecipientBadgeCollectionEditFormComponent,
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(RecipientBadgeCollectionEditFormComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #startEditing()', async () => {
		const result = component.startEditing();
	});

	it('should run #cancelEditing()', async () => {
		const result = component.cancelEditing();
	});

	it('should run #onSubmit()', async () => {
		const result = component.onSubmit();
	});
});
