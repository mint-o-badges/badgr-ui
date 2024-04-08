// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive, ElementRef, Renderer2 } from '@angular/core';
import { BadgeSelectionDialog } from './badge-selection-dialog.component';
import { BadgeClassManager } from '../../services/badgeclass-manager.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { MessageService } from '../../../common/services/message.service';
import { SettingsService } from '../../../common/services/settings.service';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BgAwaitPromises } from '../../../common/directives/bg-await-promises';

describe('BadgeSelectionDialog', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeSelectionDialog, BgAwaitPromises],
			imports: [RouterTestingModule, CommonModule, FormsModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeSelectionDialog);
		component = fixture.debugElement.componentInstance;
		component.open = false;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #openDialog()', async () => {
		// const result = component.openDialog({ dialogId, dialogTitle, multiSelectMode, restrictToIssuerId, selectedBadges, omittedBadges });
	});

	xit('should run #cancelDialog()', async () => {
		const result = component.cancelDialog();
	});

	xit('should run #saveDialog()', async () => {
		const result = component.saveDialog();
	});

	xit('should run #updateBadgeSelection()', async () => {
		//const result = component.updateBadgeSelection(badgeClass, select);
	});

	it('should run #applySorting()', async () => {
		const result = component.applySorting();
	});

	it('should run #loadSettings()', async () => {
		const result = component.loadSettings();
	});

	it('should run #saveSettings()', async () => {
		const result = component.saveSettings();
	});

	it('should run #updateData()', async () => {
		const result = component.updateData();
	});

	xit('should run #updateBadges()', async () => {
		// const result = component.updateBadges(badgesByIssuerUrl, allBadges, issuers);
	});

	xit('should run #updateResults()', async () => {
		const result = component.updateResults();
	});
});
