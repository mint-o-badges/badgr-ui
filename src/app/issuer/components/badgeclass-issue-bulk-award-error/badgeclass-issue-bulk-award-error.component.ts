import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../common/services/session.service';
import { MessageService } from '../../../common/services/message.service';
import { Title } from '@angular/platform-browser';
import { BaseAuthenticatedRoutableComponent } from '../../../common/pages/base-authenticated-routable.component';
import { EmailValidator } from '../../../common/validators/email.validator';
import { TransformedImportData, ViewState } from '../badgeclass-issue-bulk-award/badgeclass-issue-bulk-award.component';
import { UrlValidator } from '../../../common/validators/url.validator';

@Component({
	selector: 'badgeclass-issue-bulk-award-error',
	templateUrl: './badgeclass-issue-bulk-award-error.component.html',
	standalone: false,
})
export class BadgeclassIssueBulkAwardError extends BaseAuthenticatedRoutableComponent implements OnInit {
	@Input() transformedImportData: TransformedImportData;
	@Output() updateStateEmitter = new EventEmitter<ViewState>();

	importErrorForm: FormGroup;
	issuer: string;

	constructor(
		protected formBuilder: FormBuilder,
		protected sessionService: SessionService,
		protected messageService: MessageService,
		protected router: Router,
		protected route: ActivatedRoute,
		protected title: Title,
	) {
		super(router, route, sessionService);
	}

	ngOnInit() {
		this.initImportErrorForm();
		this.markFormControllsAsDirty();
	}

	initImportErrorForm() {
		const createFormArray = () => {
			const formArray = [];
			this.transformedImportData.invalidRowsTransformed.forEach((row) => {
				formArray.push(
					this.formBuilder.group({
						name: [row.name, Validators.required],
						email: [row.email, Validators.compose([Validators.required, EmailValidator.validEmail])],
					}),
				);
			});
			return formArray;
		};

		this.importErrorForm = this.formBuilder.group({
			users: this.formBuilder.array(createFormArray()),
		});
	}

	continueButtonAction() {
		if (!this.importErrorForm.valid) {
			this.markFormControllsAsDirty();
		} else {
			this.importErrorForm.value['users'].forEach((row) => {
				this.transformedImportData.validRowsTransformed.add({
					name: row['name'] ? row['name'].trim() : null,
					email: row['email'] ? row['email'].trim() : null,
				});
			});
			this.removeDuplicateEmails();
			this.updateViewState('importConformation');
		}
	}

	updateViewState(state: ViewState) {
		this.updateStateEmitter.emit(state);
	}

	removeDuplicateEmails() {
		const tempRow = new Set<string>();
		this.transformedImportData.validRowsTransformed.forEach((row) => {
			if (tempRow.has(row.email)) {
				this.transformedImportData.duplicateRecords.push(row);
				this.transformedImportData.validRowsTransformed.delete(row);
			} else {
				tempRow.add(row.email);
			}
		});
	}

	markFormControllsAsDirty() {
		const formArray: FormArray = this.importErrorForm.controls['users'] as FormArray;

		formArray.controls.forEach((group: FormGroup) => {
			Object.getOwnPropertyNames(group.controls).forEach((controlName) => {
				group.controls[controlName].markAsDirty();
			});
		});
	}

	removeButtonErrorState(row: number) {
		this.removeInvalidRowsTransformed(row);
		this.removeErrorFormControll(row);
	}

	removeInvalidRowsTransformed(i: number) {
		this.transformedImportData.invalidRowsTransformed.splice(i, 1);
	}

	removeErrorFormControll(controlIndex: number) {
		const control = this.importErrorForm.controls['users'] as FormArray;
		control.removeAt(controlIndex);
	}
}
