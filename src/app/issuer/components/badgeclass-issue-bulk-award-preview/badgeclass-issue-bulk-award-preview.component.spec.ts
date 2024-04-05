// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgeClassIssueBulkAwardPreviewComponent } from './badgeclass-issue-bulk-award-preview.component';
import { FormBuilder } from '@angular/forms';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('BadgeClassIssueBulkAwardPreviewComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassIssueBulkAwardPreviewComponent],
			imports: [RouterTestingModule, CommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgeClassIssueBulkAwardPreviewComponent);
		fixture.componentInstance.importPreviewData = {
			columnHeaders: [],
			invalidRows: [],
			rowLongerThenHeader: false,
			rows: [],
			validRows: [],
		};
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnChanges()', async () => {
		// const result = component.ngOnChanges(changes);
	});

	it('should run #disableActionButton()', async () => {
		// const result = component.disableActionButton();
	});

	it('should run #enableActionButton()', async () => {
		// const result = component.enableActionButton();
	});

	it('should run #updateViewState()', async () => {
		// const result = component.updateViewState(state);
	});

	it('should run #emitTransformedData()', async () => {
		// const result = component.emitTransformedData();
	});

	it('should run #isEmailColumnHeaderMapped()', async () => {
		// const result = component.isEmailColumnHeaderMapped();
	});

	it('should run #generateImportPreview()', async () => {
		// const result = component.generateImportPreview();
	});

	it('should run #removeFromInvalidRowsWithEmptyOptionalCells()', async () => {
		// const result = component.removeFromInvalidRowsWithEmptyOptionalCells();
	});

	it('should run #transformInvalidRows()', async () => {
		// const result = component.transformInvalidRows();
	});

	it('should run #transformValidRows()', async () => {
		// const result = component.transformValidRows();
	});

	it('should run #removeDuplicateEmails()', async () => {
		// const result = component.removeDuplicateEmails();
	});

	it('should run #mapDestNameToSourceName()', async () => {
		// const result = component.mapDestNameToSourceName(columnHeaderId, selected);
	});

	it('should run #getEvidenceFromRow()', async () => {
		// const result = component.getEvidenceFromRow(row);
	});

	it('should run #getEmailFromRow()', async () => {
		// const result = component.getEmailFromRow(row);
	});

	it('should run #getCellFromRowByDestName()', async () => {
		// const result = component.getCellFromRowByDestName(destName, row);
	});

	it('should run #generateDestNameToColumnHeaderMap()', async () => {
		// const result = component.generateDestNameToColumnHeaderMap();
	});

	it('should run #createRange()', async () => {
		// const result = component.createRange(size);
	});
});
