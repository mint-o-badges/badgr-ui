import { Injectable, ErrorHandler, inject } from '@angular/core';
import { CommonDialogsService } from './common/services/common-dialogs.service';
import { ErrorDialogComponent } from './common/dialogs/oeb-dialogs/error-dialog.component';
import { HlmDialogService } from './components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	private readonly _hlmDialogService = inject(HlmDialogService);

	constructor() {}

	handleError(error: any): void {
		// Logge den Fehler (optional)
		const dialogRef = this._hlmDialogService.open(ErrorDialogComponent, {
			context: {
				error: error,
			},
		});
	}
}
