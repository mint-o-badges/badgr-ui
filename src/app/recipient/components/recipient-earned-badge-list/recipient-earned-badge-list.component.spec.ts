// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { Component, Directive } from '@angular/core';
import { RecipientEarnedBadgeListComponent } from './recipient-earned-badge-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { Title } from '@angular/platform-browser';
import { CommonDialogsService } from '../../../common/services/common-dialogs.service';
import { MessageService } from '../../../common/services/message.service';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { UserProfileManager } from '../../../common/services/user-profile-manager.service';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS, commonDialog } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecipientEarnedBadgeListComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        CommonModule,
        BadgrCommonModule,
        TranslateTestingModule.withTranslations('de', {}),
        ...COMMON_IMPORTS,
        RecipientEarnedBadgeListComponent,
    ],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    teardown: { destroyAfterEach: false },
}).compileComponents();
		fixture = TestBed.createComponent(RecipientEarnedBadgeListComponent);
		component = fixture.debugElement.componentInstance;
		component.route.snapshot.routeConfig = { path: '/' };
		component.addBadgeDialog = commonDialog;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #restoreDisplayState()', async () => {
		const result = component.restoreDisplayState();
	});

	it('should run #saveDisplayState()', async () => {
		const result = component.saveDisplayState();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #addBadge()', async () => {
		const result = component.addBadge();
	});

	xit('should run #shareBadge()', async () => {
		// const result = component.shareBadge(badge);
	});

	xit('should run #deleteBadge()', async () => {
		// const result = component.deleteBadge(badge);
	});

	xit('should run #updateBadges()', async () => {
		// const result = component.updateBadges(allBadges);
	});

	it('should run #updateResults()', async () => {
		const result = component.updateResults();
	});
});
