import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import {
	BulkIssueImportPreviewData,
	ColumnHeaders,
	DestSelectOptions,
	ViewState,
} from '../badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';

@Component({
	selector: 'Badgeclass-issue-bulk-award-import',
	templateUrl: './badgeclass-issue-bulk-award-import.component.html',
})
export class BadgeClassIssueBulkAwardImportComponent extends BaseAuthenticatedRoutableComponent {
	readonly csvUploadIconUrl = '../../../../breakdown/static/images/csvuploadicon.svg';

	@Output() importPreviewDataEmitter = new EventEmitter<BulkIssueImportPreviewData>();
	@Output() updateStateEmitter = new EventEmitter<ViewState>();

	columnHeadersCount: number;
	csvForm: FormGroup;
	importPreviewData: BulkIssueImportPreviewData;
	issuer: string;
	rawCsv: string = null;
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

		this.csvForm = formBuilder.group({
			file: [],
		} as ImportCsvForm<Array<unknown>>);
	}

	importAction() {
		this.parseCsv(this.rawCsv);
		this.importPreviewDataEmit();
	}

	importPreviewDataEmit() {
		this.importPreviewDataEmitter.emit(this.importPreviewData);
	}

	updateViewState(state: ViewState) {
		this.viewState = state;
		this.updateStateEmitter.emit(state);
	}

	onFileDataReceived(data) {
		this.rawCsv = data;
	}

	//////// Parsing ////////
	parseCsv(rawCSV: string) {
		const parseRow = (rawRow: string) => {
			rows.push(rawRow.split(/[,;]/).map((r) => r.trim()));
		};

		const padRowWithMissingCells = (row: string[]) =>
			row.concat(this.createRange(this.columnHeadersCount - row.length));

		const generateColumnHeaders = (): ColumnHeaders[] => {
			const theseColumnHeaders = [];
			const inferredColumnHeaders = new Set<string>();

			rows.shift().forEach((columnHeaderName: string) => {
				const tempColumnHeaderName: string = columnHeaderName.toLowerCase();
				let destinationColumn: DestSelectOptions;

				if (tempColumnHeaderName === 'email') {
					inferredColumnHeaders.add('email');
					destinationColumn = 'email';
				}

				if (tempColumnHeaderName === 'name') {
					inferredColumnHeaders.add('name');
					destinationColumn = 'name';
				}

				if (tempColumnHeaderName.includes('evidence')) {
					inferredColumnHeaders.add('evidence');
					destinationColumn = 'evidence';
				}

				theseColumnHeaders.push({
					destColumn: destinationColumn ? destinationColumn : 'NA',
					sourceName: columnHeaderName,
				});
			});

			return theseColumnHeaders;
		};

		const rows = [];
		const validRows: string[][] = [];
		const invalidRows: string[][] = [];

		rawCSV.match(/[^\r\n]+/g).forEach((row) => parseRow(row));

		const columnHeaders: ColumnHeaders[] = generateColumnHeaders();
		this.columnHeadersCount = columnHeaders.length;

		rows.forEach((row) => {
			// Valid if all the cells in a row are not empty.
			const rowIsValid: boolean = row.every((cell) => cell.length > 0);

			if (row.length < this.columnHeadersCount) {
				invalidRows.push(padRowWithMissingCells(row));
			} else {
				rowIsValid ? validRows.push(row) : invalidRows.push(row);
			}
		});

		this.importPreviewData = {
			columnHeaders,
			invalidRows,
			rowLongerThenHeader: rows.some((row) => row.length > this.columnHeadersCount),
			rows,
			validRows,
		} as BulkIssueImportPreviewData;
	}

	createRange = (size: number) => {
		const items: string[] = [];
		for (let i = 1; i <= size; i++) {
			items.push('');
		}
		return items;
	};
}

interface ImportCsvForm<T> {
	file: T;
}
