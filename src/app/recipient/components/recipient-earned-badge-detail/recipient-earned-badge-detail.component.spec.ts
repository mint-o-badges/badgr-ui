// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { RecipientEarnedBadgeDetailComponent } from './recipient-earned-badge-detail.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { EventsService } from '../../../common/services/events.service';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { AppConfigService } from '../../../common/app-config.service';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { QueryParametersService } from '../../../common/services/query-parameters.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('RecipientEarnedBadgeDetailComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				RecipientEarnedBadgeDetailComponent,
				...COMMON_IMPORTS,
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(RecipientEarnedBadgeDetailComponent);
		component = fixture.debugElement.componentInstance;
		//component.recipientBadgeManager.recipientBadgeList.loadedPromise.then = ()=>{}
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #shareBadge()', async () => {
		const result = component.shareBadge();
	});

	xit('should run #deleteBadge()', async () => {
		// const result = component.deleteBadge(badge);
	});

	xit('should run #manageCollections()', async () => {
		const result = component.manageCollections();
	});

	xit('should run #removeCollection()', async () => {
		// const result = component.removeCollection(collection);
	});

	xit('should run #updateBadge()', async () => {
		// const result = component.updateBadge(results);
	});

	xit('should run #updateData()', async () => {
		const result = component.updateData();
	});

	xit('should run #clickLaunchpoint()', async () => {
		// const result = component.clickLaunchpoint(launchpoint);
	});
});
