import { Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { HlmIconComponent, provideIcons } from '../../../components/spartan/ui-icon-helm/src';
import { lucideClipboard, lucideCircleX, lucideCheck } from '@ng-icons/lucide';
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
	providers: [provideIcons({ lucideCircleX, lucideClipboard, lucideCheck })],
	template: `
		<oeb-dialog variant="danger" class="tw-text-center tw-text-oebblack oeb">
			<div class="tw-flex tw-flex-col tw-gap-2 tw-items-center tw-justify-center tw-p-4">
				<hlm-icon class="tw-text-red" size="xxxl" name="lucideCircleX" />
				<div hlmH3 class="tw-font-bold !tw-text-black tw-uppercase">
					{{ 'ErrorDialog.title' | translate }}
				</div>
				<div hlmP class="tw-text-black tw-mb-4">
					{{ 'ErrorDialog.message' | translate }}
				</div>
				<div class="tw-w-full">
					<label for="errorTextarea" class="tw-block tw-text-left tw-mb-2 font-bold"
						>Full Error Details:</label
					>
					<textarea
						#errorTextarea
						class="tw-w-full tw-h-48 tw-border tw-border-gray-300 tw-rounded tw-p-2 tw-text-sm tw-overflow-auto tw-bg-gray-100 tw-resize-none"
						readonly
						>{{ formattedError }}</textarea
					>
					<div class="tw-flex tw-w-full tw-justify-center">
						<button
							class="tw-mt-4 tw-bg-blue-500 tw-text-white tw-px-4 tw-py-2 tw-rounded hover:tw-bg-blue-600 tw-flex tw-items-center tw-justify-center"
							(click)="copyErrorMessage()"
						>
							<hlm-icon
								*ngIf="isCopied"
								name="lucideCheck"
								size="sm"
								class="tw-inline-block tw-mr-2"
							></hlm-icon>
							<hlm-icon
								*ngIf="!isCopied"
								name="lucideClipboard"
								size="sm"
								class="tw-inline-block tw-mr-2"
							></hlm-icon>
							{{
								isCopied
									? ('ErrorDialog.copyButtonAfter' | translate)
									: ('ErrorDialog.copyButton' | translate)
							}}
						</button>
					</div>
				</div>
				<div class="tw-flex tw-gap-4">
					<div class="tw-flex  tw-items-center tw-gap-2 tw-mt-4">
						<hlm-icon name="lucideGithub" size="lg" />
						<a
							href="https://github.com/mint-o-badges/badgr-ui/issues"
							target="_blank"
							class="tw-text-blue-500 hover:tw-underline"
						>
							{{ 'ErrorDialog.createIssue' | translate }}
						</a>
					</div>
					<div class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
						<hlm-icon name="lucideMail" size="lg" />
						<a
							href="mailto:support@openbadges.education?subject=Frage%20zu%20Fehlermeldung"
							class="tw-text-blue-500 hover:tw-underline"
						>
							{{ 'ErrorDialog.sendEmail' | translate }}
						</a>
					</div>
				</div>
				<div class="tw-flex tw-flex-row tw-w-full tw-gap-4 tw-justify-center tw-mt-6">
					<oeb-button size="md" [text]="'Ok'" (click)="confirm()"></oeb-button>
				</div>
			</div>
		</oeb-dialog>
	`,
})
export class ErrorDialogComponent {
	private readonly _dialogContext = injectBrnDialogContext<{ error: any; variant: string }>();
	protected readonly error = this._dialogContext.error;
	protected readonly variant = this._dialogContext.variant;
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

	protected readonly formattedError = JSON.stringify(this.error, null, 2);
	protected isCopied = false;

	public closeDialog() {
		this._dialogRef.close('cancel');
	}

	public confirm() {
		this._dialogRef.close('confirm');
	}

	public copyErrorMessage() {
		navigator.clipboard.writeText(this.formattedError).then(() => {
			this.isCopied = true;
		});
	}
}
