// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassDetailComponent } from './badgeclass-detail.component';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { BadgeInstanceManager } from '../../services/badgeinstance-manager.service';
import { SessionService } from '../../../common/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { EventsService } from '../../../common/services/events.service';
import { AppConfigService } from '../../../common/app-config.service';
import { ExternalToolsManager } from '../../../externaltools/services/externaltools-manager.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrButtonComponent } from '../../../common/components/badgr-button.component';
import { CommonEntityManager } from '../../../entity-manager/services/common-entity-manager.service';

describe('BadgeClassDetailComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassDetailComponent],
			imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [CommonEntityManager, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassDetailComponent);
		component = fixture.debugElement.componentInstance;
	});

	// it('should create a component', async () => {
	// 	expect(component).toBeTruthy();
	// });

	xit('should run #loadInstances()', async () => {
		//  const result = component.loadInstances(recipientQuery);
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #revokeInstance()', async () => {
		//  const result = component.revokeInstance(instance);
	});

	xit('should run #deleteBadge()', async () => {
		// TODO: This doesn't compile, because *something* is possibly 'undefined'
		//this!.recipientCount = 0;
		const result = component.deleteBadge();
	});

	xit('should run #shareInstance()', async () => {
		//  const result = component.shareInstance(instance);
	});

	xit('should run #badgeShareDialogOptionsFor()', async () => {
		//const result = component.badgeShareDialogOptionsFor(badge);
	});

	xit('should run #updateResults()', async () => {
		const result = component.updateResults();
	});

	xit('should run #hasNextPage()', async () => {
		const result = component.hasNextPage();
	});

	xit('should run #hasPrevPage()', async () => {
		const result = component.hasPrevPage();
	});

	xit('should run #clickNextPage()', async () => {
		const result = component.clickNextPage();
	});

	xit('should run #clickPrevPage()', async () => {
		const result = component.clickPrevPage();
	});

	xit('should run #clickLaunchpoint()', async () => {
		//  const result = component.clickLaunchpoint(launchpoint, instanceSlug);
	});
});
