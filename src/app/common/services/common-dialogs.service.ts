import { Injectable } from '@angular/core';
import { ConfirmDialog } from '../dialogs/confirm-dialog.component';
import { ShareSocialDialog } from '../dialogs/share-social-dialog/share-social-dialog.component';
import { NewTermsDialog } from '../dialogs/new-terms-dialog.component';
import { MarkdownHintsDialog } from '../dialogs/markdown-hints-dialog.component';
import { ExportPdfDialog } from '../dialogs/export-pdf-dialog/export-pdf-dialog.component';
import { NounprojectDialog } from '../dialogs/nounproject-dialog/nounproject-dialog.component';
import { CopyBadgeDialog } from '../dialogs/copy-badge-dialog/copy-badge-dialog.component';
import { ForkBadgeDialog } from '../dialogs/fork-badge-dialog/fork-badge-dialog.component';
import { SelectIssuerDialog } from '../dialogs/select-issuer-dialog/select-issuer-dialog.component';

@Injectable({ providedIn: 'root' })
export class CommonDialogsService {
	confirmDialog: ConfirmDialog;
	shareSocialDialog: ShareSocialDialog;
	newTermsDialog: NewTermsDialog;
	markdownHintsDialog: MarkdownHintsDialog;
	exportPdfDialog: ExportPdfDialog;
	nounprojectDialog: NounprojectDialog;
	copyBadgeDialog: CopyBadgeDialog;
	forkBadgeDialog: ForkBadgeDialog;
	selectIssuerDialog: SelectIssuerDialog;
	constructor() {}

	init(
		confirmDialog: ConfirmDialog,
		shareSocialDialog: ShareSocialDialog,
		newTermsDialog: NewTermsDialog,
		markdownHintsDialog: MarkdownHintsDialog,
		exportPdfDialog: ExportPdfDialog,
		nounprojectDialog: NounprojectDialog,
		copyBadgeDialog: CopyBadgeDialog,
		forkBadgeDialog: ForkBadgeDialog,
		selectIssuerDialog: SelectIssuerDialog,
	) {
		this.confirmDialog = confirmDialog;
		this.shareSocialDialog = shareSocialDialog;
		this.newTermsDialog = newTermsDialog;
		this.markdownHintsDialog = markdownHintsDialog;
		this.exportPdfDialog = exportPdfDialog;
		this.nounprojectDialog = nounprojectDialog;
		this.copyBadgeDialog = copyBadgeDialog;
		this.forkBadgeDialog = forkBadgeDialog;
		this.selectIssuerDialog = selectIssuerDialog;
	}
}
