import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';

import {
	BulkIssueData,
	BulkIssueImportPreviewData,
	DestSelectOptions,
	TransformedImportData,
	ViewState,
} from '../badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';

@Component({
    selector: 'Badgeclass-issue-bulk-award-preview',
    templateUrl: './badgeclass-issue-bulk-award-preview.component.html',
    standalone: false
})
export class BadgeClassIssueBulkAwardPreviewComponent extends BaseAuthenticatedRoutableComponent {
	@Input() importPreviewData: BulkIssueImportPreviewData;

	@Output() updateStateEmitter = new EventEmitter<ViewState>();
	@Output() transformedImportDataEmitter = new EventEmitter();

	MAX_ROWS_TO_DISPLAY = 5;

	buttonDisabledAttribute = true;
	buttonDisabledClass = true;
	columnHeadersCount: number;
	destNameToColumnHeaderMap: {
		[destColumnName: string]: number;
	};
	duplicateRecords: BulkIssueData[] = [];

	rowIsLongerThanHeader: boolean;
	validRowsTransformed = new Set<BulkIssueData>();
	invalidRowsTransformed = Array<BulkIssueData>();

	viewState: ViewState;

	constructor(
		protected formBuilder: FormBuilder,
		protected loginService: SessionService,
		protected messageService: MessageService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected title: Title,
	) {
		super(router, route, loginService);
	}

	ngOnChanges(changes) {
		this.disableActionButton();
		this.rowIsLongerThanHeader = this.importPreviewData.rowLongerThenHeader;
		this.columnHeadersCount = this.importPreviewData.columnHeaders.length;

		if (!this.importPreviewData.rowLongerThenHeader) {
			this.isEmailColumnHeaderMapped() ? this.enableActionButton() : this.disableActionButton();
		}
	}

	disableActionButton() {
		this.buttonDisabledClass = true;
		this.buttonDisabledAttribute = true;
	}

	enableActionButton() {
		this.buttonDisabledClass = false;
		this.buttonDisabledAttribute = null;
	}

	updateViewState(state: ViewState) {
		this.viewState = state;
		this.updateStateEmitter.emit(state);
	}

	emitTransformedData() {
		const transformedImportData: TransformedImportData = {
			duplicateRecords: this.duplicateRecords,
			validRowsTransformed: this.validRowsTransformed,
			invalidRowsTransformed: this.invalidRowsTransformed,
		};

		this.transformedImportDataEmitter.emit(transformedImportData);
	}

	isEmailColumnHeaderMapped(): boolean {
		return this.importPreviewData.columnHeaders.some((columnHeader) => columnHeader.destColumn === 'email');
	}

	//////// Generating import data ////////
	generateImportPreview() {
		this.generateDestNameToColumnHeaderMap();
		this.removeFromInvalidRowsWithEmptyOptionalCells();
		this.transformInvalidRows();
		this.transformValidRows();
		this.removeDuplicateEmails();
		this.emitTransformedData();
	}

	removeFromInvalidRowsWithEmptyOptionalCells() {
		const invalidRow = [];
		let emptyCellsAreOptional: boolean;

		this.importPreviewData.invalidRows.forEach((row) => {
			emptyCellsAreOptional = row.every((cell, index) => {
				if (cell.length) {
					return true;
				} 
				else {
					return false;
				}
			});

			emptyCellsAreOptional ? this.importPreviewData.validRows.push(row) : invalidRow.push(row);
		});

		this.importPreviewData.invalidRows = invalidRow;
	}

	transformInvalidRows() {
		this.importPreviewData.invalidRows.forEach((row) => {
			this.invalidRowsTransformed.push({
				email: this.getEmailFromRow(row),
				name: this.getNameFromRow(row)
			});
		});
	}

	transformValidRows() {
		this.importPreviewData.validRows.forEach((row) => {
			this.validRowsTransformed.add({
				email: this.getEmailFromRow(row),
				name: this.getNameFromRow(row)

			});
		});
	}

	removeDuplicateEmails() {
		const tempRow = new Set<string>();
		this.validRowsTransformed.forEach((row) => {
			if (tempRow.has(row.email)) {
				this.duplicateRecords.push(row);
				this.validRowsTransformed.delete(row);
			} else {
				tempRow.add(row.email);
			}
		});
	}

	mapDestNameToSourceName(columnHeaderId: number, selected: DestSelectOptions) {
		Object.keys(this.importPreviewData.columnHeaders).forEach((columnId) => {
			if (
				columnId !== columnHeaderId.toString() &&
				this.importPreviewData.columnHeaders[columnId].destColumn === selected
			) {
				this.importPreviewData.columnHeaders[columnId].destColumn = 'NA';
			}

			if (columnId === columnHeaderId.toString()) {
				this.importPreviewData.columnHeaders[columnId].destColumn = selected;
			}
		});

		this.isEmailColumnHeaderMapped() ? this.enableActionButton() : this.disableActionButton();
	}

	getEmailFromRow(row) {
		return this.getCellFromRowByDestName('email', row);
	}

	getNameFromRow(row) {
		return this.getCellFromRowByDestName('name', row);
	}

	getCellFromRowByDestName(destName: string, row: Object) {
		return row[this.destNameToColumnHeaderMap[destName]];
	}

	generateDestNameToColumnHeaderMap() {
		this.destNameToColumnHeaderMap = {};
		Object.keys(this.importPreviewData.columnHeaders).forEach((key) => {
			if (this.importPreviewData.columnHeaders[key].destColumn !== 'NA') {
				this.destNameToColumnHeaderMap[this.importPreviewData.columnHeaders[key].destColumn] = Number(key);
			}
		});
	}

	createRange(size: number) {
		const items: string[] = [];
		for (let i = 1; i <= size; i++) {
			items.push('');
		}
		return items;
	}
}
