import { Injectable } from '@angular/core';
import { ConfirmDialog } from '../dialogs/confirm-dialog.component';
import { ShareSocialDialog } from '../dialogs/share-social-dialog/share-social-dialog.component';
import { NewTermsDialog } from '../dialogs/new-terms-dialog.component';
import { ExportPdfDialog } from '../dialogs/export-pdf-dialog/export-pdf-dialog.component';
import { NounprojectDialog } from '../dialogs/nounproject-dialog/nounproject-dialog.component';

@Injectable({ providedIn: 'root' })
export class CommonDialogsService {
	confirmDialog: ConfirmDialog;
	newTermsDialog: NewTermsDialog;
	exportPdfDialog: ExportPdfDialog;
	nounprojectDialog: NounprojectDialog;
	constructor() {}

	init(
		confirmDialog: ConfirmDialog,
		newTermsDialog: NewTermsDialog,
		exportPdfDialog: ExportPdfDialog,
		nounprojectDialog: NounprojectDialog,
	) {
		this.confirmDialog = confirmDialog;
		this.newTermsDialog = newTermsDialog;
		this.exportPdfDialog = exportPdfDialog;
		this.nounprojectDialog = nounprojectDialog;
	}
}
