// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive, ElementRef, Renderer2 } from '@angular/core';
import { RecipientBadgeSelectionDialog } from './recipient-badge-selection-dialog.component';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { MessageService } from '../../../common/services/message.service';
import { SettingsService } from '../../../common/services/settings.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { FormsModule } from '@angular/forms';
import { RecipientBadgeCollection } from '../../models/recipient-badge-collection.model';

describe('RecipientBadgeSelectionDialog', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [RecipientBadgeSelectionDialog],
			imports: [RouterTestingModule, CommonModule, FormsModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(RecipientBadgeSelectionDialog);
		component = fixture.debugElement.componentInstance;
		component.resolveFunc = () => {};
		component.allBadges = [];
		component.allIssuers = [];
		component.open = false;
		component.close = false;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #openDialog()', async () => {
		// const result = component.openDialog({ dialogId, dialogTitle, multiSelectMode, restrictToIssuerId, omittedCollection });
	});

	it('should run #cancelDialog()', async () => {
		const result = component.cancelDialog();
	});

	it('should run #saveDialog()', async () => {
		const result = component.saveDialog();
	});

	xit('should run #updateBadgeSelection()', async () => {
		// const result = component.updateBadgeSelection(badgeClass, select);
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
		// const result = component.updateBadges(allBadges);
	});

	it('should run #updateResults()', async () => {
		const result = component.updateResults();
	});
});
