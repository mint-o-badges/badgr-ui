import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { HlmH1 } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmP } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { HlmH3 } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';
import { BgFormFieldFileComponent } from '../../../common/components/formfield-file';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'Badgeclass-issue-bulk-award-import',
	templateUrl: './badgeclass-issue-bulk-award-import.component.html',
	imports: [
		HlmH1,
		HlmP,
		HlmH3,
		FormsModule,
		ReactiveFormsModule,
		BgFormFieldFileComponent,
		OebButtonComponent,
		TranslatePipe,
	],
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

	get zipFileControl(): FormControl {
		return this.csvForm.get('zipFile') as FormControl;
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

				if (tempColumnHeaderName === 'email' || tempColumnHeaderName === 'e-mail-adresse') {
					inferredColumnHeaders.add('email');
					destinationColumn = 'email';
				}

				if (tempColumnHeaderName === 'name' || tempColumnHeaderName === 'vor- / nachname') {
					inferredColumnHeaders.add('name');
					destinationColumn = 'name';
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

		for (let row of rows) {
			// Valid if all the cells in a row are not empty.
			const rowIsValid: boolean = row.every((cell, i) => cell.length > 0);

			if (row.length < this.columnHeadersCount) {
				invalidRows.push(padRowWithMissingCells(row));
			} else {
				rowIsValid ? validRows.push(row) : invalidRows.push(row);
			}
		}

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
