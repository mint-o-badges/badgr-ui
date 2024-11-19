import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { HlmIconComponent, provideIcons } from '../../../components/spartan/ui-icon-helm/src';
import { lucideTriangleAlert, lucideGithub, lucideClipboard, lucideCircleX } from '@ng-icons/lucide';
import { HlmH3Directive, HlmPDirective } from '../../../components/spartan/ui-typography-helm/src';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

@Component({
	selector: 'oeb-error-dialog',
	standalone: true,
	imports: [
		OebDialogComponent,
		HlmPDirective,
		HlmH3Directive,
		HlmIconComponent,
		OebButtonComponent,
		TranslateModule,
		NgIf,
	],
	providers: [provideIcons({ lucideCircleX, lucideGithub, lucideClipboard })],
	template: `
		<oeb-dialog variant="danger" class="tw-text-center tw-text-oebblack oeb">
			<div class="tw-flex tw-flex-col tw-gap-2 tw-items-center tw-justify-center">
				<hlm-icon class="tw-text-red" size="xxxl" name="lucideCircleX   " />
				<div hlmH3 class="tw-font-bold !tw-text-black tw-uppercase">
					{{ 'ErrorDialog.title' | translate }}
				</div>
				<div hlmP class="tw-text-black">
					{{ 'ErrorDialog.message' | translate }}
				</div>
				<div *ngIf="error">
					<label for="errorTextarea" class="tw-block tw-text-left tw-mb-1">Error message:</label>
					<textarea
						#errorTextarea
						class="tw-w-full tw-h-32 tw-border tw-border-gray-300 tw-rounded tw-p-2 tw-text-sm tw-overflow-auto tw-bg-gray-100 tw-resize-none"
						readonly
						>{{ error }}</textarea
					>
					<button
						class="tw-mt-2 tw-bg-blue-500 tw-text-white tw-px-4 tw-py-2 tw-rounded hover:tw-bg-blue-600"
						(click)="copyErrorMessage(errorTextarea)"
					>
						<hlm-icon name="lucideClipboard" size="sm" class="tw-inline-block tw-mr-1" />
						{{ 'ErrorDialog.copyButton' | translate }}
					</button>
				</div>
				<div class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
					<hlm-icon name="lucideGithub" size="lg" />
					<a
						href="https://github.com/your-repo/issues/new"
						target="_blank"
						class="tw-text-blue-500 hover:tw-underline"
					>
						{{ 'ErrorDialog.createIssue' | translate }}
					</a>
				</div>
				<div class="tw-flex tw-flex-row tw-gap-4 tw-justify-center tw-mt-4">
					<oeb-button
						size="md"
						variant="secondary"
						[text]="'General.cancel' | translate"
						(click)="closeDialog()"
					></oeb-button>
					<oeb-button size="md" [text]="'General.ok' | translate" (click)="confirm()"></oeb-button>
				</div>
			</div>
		</oeb-dialog>
	`,
})
export class ErrorDialogComponent {
	private readonly _dialogContext = injectBrnDialogContext<{ error: string; variant: string }>();
	protected readonly error = this._dialogContext.error;
	protected readonly variant = this._dialogContext.variant;
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

	public closeDialog() {
		this._dialogRef.close('cancel');
	}

	public confirm() {
		this._dialogRef.close('confirm');
	}

	public copyErrorMessage(textarea: HTMLTextAreaElement) {
		textarea.select();
		document.execCommand('copy');
	}
}
